package com.rentalconnect.controller;

import com.rentalconnect.dto.BookingDTO;
import com.rentalconnect.entity.Booking;
import com.rentalconnect.entity.Notification;
import com.rentalconnect.entity.Payment;
import com.rentalconnect.entity.Product;
import com.rentalconnect.entity.User;
import com.rentalconnect.repository.BookingRepository;
import com.rentalconnect.repository.NotificationRepository;
import com.rentalconnect.repository.PaymentRepository;
import com.rentalconnect.repository.ProductRepository;
import com.rentalconnect.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.security.Principal;
import java.time.LocalDate;
import java.time.temporal.ChronoUnit;
import java.util.List;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/bookings")
public class BookingController {

    @Autowired
    private BookingRepository bookingRepository;

    @Autowired
    private ProductRepository productRepository;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private PaymentRepository paymentRepository;

    @Autowired
    private NotificationRepository notificationRepository;

    @GetMapping("/my-rentals")
    public ResponseEntity<List<BookingDTO>> getMyRentals(Principal principal) {
        User user = userRepository.findByUsername(principal.getName()).orElseThrow();
        List<BookingDTO> list = bookingRepository.findByRenterId(user.getId()).stream()
                .map(this::mapToDTO)
                .collect(Collectors.toList());
        return ResponseEntity.ok(list);
    }

    @GetMapping("/owner-rentals")
    public ResponseEntity<List<BookingDTO>> getOwnerRentals(Principal principal) {
        User user = userRepository.findByUsername(principal.getName()).orElseThrow();
        List<BookingDTO> list = bookingRepository.findByProductOwnerId(user.getId()).stream()
                .map(this::mapToDTO)
                .collect(Collectors.toList());
        return ResponseEntity.ok(list);
    }

    @PostMapping
    public ResponseEntity<?> createBooking(@RequestBody BookingDTO dto, Principal principal) {
        User renter = userRepository.findByUsername(principal.getName()).orElseThrow();
        Product product = productRepository.findById(dto.getProductId())
                .orElseThrow(() -> new RuntimeException("Product not found"));

        if (product.getOwner().getId().equals(renter.getId())) {
            return ResponseEntity.badRequest().body("You cannot rent your own product!");
        }

        LocalDate start = dto.getStartDate();
        LocalDate end = dto.getEndDate();

        if (start.isBefore(LocalDate.now())) {
            return ResponseEntity.badRequest().body("Start date cannot be in the past!");
        }
        if (end.isBefore(start)) {
            return ResponseEntity.badRequest().body("End date must be after or on start date!");
        }

        // In-memory conflict checking
        List<Booking> activeBookings = bookingRepository.findByProductId(product.getId());
        for (Booking b : activeBookings) {
            if (!b.getStatus().equals("CANCELLED") && !b.getStatus().equals("RETURNED")) {
                if (!(end.isBefore(b.getStartDate()) || start.isAfter(b.getEndDate()))) {
                    return ResponseEntity.badRequest().body("This product is already booked for the selected dates!");
                }
            }
        }

        long days = ChronoUnit.DAYS.between(start, end) + 1;
        double totalPrice = product.getPricePerDay() * days;
        double deposit = product.getSecurityDeposit();

        // Create booking
        Booking booking = Booking.builder()
                .product(product)
                .renter(renter)
                .startDate(start)
                .endDate(end)
                .totalPrice(totalPrice)
                .securityDeposit(deposit)
                .status("CONFIRMED") // automatically confirm for local testing simplicity
                .paymentMethod(dto.getPaymentMethod())
                .paymentStatus(dto.getPaymentMethod().equalsIgnoreCase("CASH") ? "PENDING" : "PAID")
                .build();

        bookingRepository.save(booking);

        // Record payment transaction
        Payment payment = Payment.builder()
                .booking(booking)
                .amount(totalPrice + deposit)
                .paymentMethod(dto.getPaymentMethod())
                .transactionRef("TXN_" + System.currentTimeMillis())
                .status(booking.getPaymentStatus().equals("PAID") ? "PAID" : "FAILED")
                .build();
        paymentRepository.save(payment);

        // Create Notifications
        notificationRepository.save(Notification.builder()
                .user(product.getOwner())
                .title("New Booking Confirmed")
                .message(renter.getFullName() + " booked your item '" + product.getTitle() + "' from " + start + " to " + end + ".")
                .type("BOOKING_CONFIRMED")
                .build());

        notificationRepository.save(Notification.builder()
                .user(renter)
                .title("Booking Successful")
                .message("Your booking for '" + product.getTitle() + "' has been confirmed. Total paid: $" + totalPrice + " + $" + deposit + " deposit.")
                .type("BOOKING_CONFIRMED")
                .build());

        return ResponseEntity.ok(mapToDTO(booking));
    }

    @PutMapping("/{id}/status")
    public ResponseEntity<?> updateBookingStatus(@PathVariable Long id, @RequestParam String status, Principal principal) {
        User user = userRepository.findByUsername(principal.getName()).orElseThrow();
        Booking booking = bookingRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Booking not found"));

        Product product = booking.getProduct();

        // Security check
        boolean isOwner = product.getOwner().getId().equals(user.getId());
        boolean isRenter = booking.getRenter().getId().equals(user.getId());
        boolean isAdmin = user.getRole().name().equals("ROLE_ADMIN");

        if (!isOwner && !isRenter && !isAdmin) {
            return ResponseEntity.status(403).body("Unauthorized to update this booking.");
        }

        String oldStatus = booking.getStatus();
        booking.setStatus(status.toUpperCase());

        if (status.equalsIgnoreCase("ACTIVE")) {
            // Handed over to renter
            if (!isOwner && !isAdmin) {
                return ResponseEntity.badRequest().body("Only the owner can hand over the product.");
            }
            // Create notification
            notificationRepository.save(Notification.builder()
                    .user(booking.getRenter())
                    .title("Rental Active")
                    .message("You have picked up '" + product.getTitle() + "'. Enjoy your rental!")
                    .type("RENTAL_ACTIVE")
                    .build());
        } else if (status.equalsIgnoreCase("RETURNED")) {
            // Returned back to owner
            if (!isOwner && !isAdmin) {
                return ResponseEntity.badRequest().body("Only the owner can verify the return.");
            }
            booking.setPaymentStatus("REFUNDED"); // deposit refunded
            
            // Record deposit refund payment ledger entry
            paymentRepository.save(Payment.builder()
                    .booking(booking)
                    .amount(booking.getSecurityDeposit())
                    .paymentMethod(booking.getPaymentMethod())
                    .transactionRef("REF_" + System.currentTimeMillis())
                    .status("REFUNDED")
                    .build());

            // Create notification
            notificationRepository.save(Notification.builder()
                    .user(booking.getRenter())
                    .title("Deposit Refunded")
                    .message("Your return for '" + product.getTitle() + "' is verified. Your security deposit of $" + booking.getSecurityDeposit() + " has been refunded.")
                    .type("DEPOSIT_REFUNDED")
                    .build());
        } else if (status.equalsIgnoreCase("CANCELLED")) {
            // Renter can cancel before start date
            if (oldStatus.equals("ACTIVE") || oldStatus.equals("RETURNED")) {
                return ResponseEntity.badRequest().body("Cannot cancel an active or completed rental.");
            }
            // Refund payment if paid
            if (booking.getPaymentStatus().equals("PAID")) {
                booking.setPaymentStatus("REFUNDED");
                paymentRepository.save(Payment.builder()
                        .booking(booking)
                        .amount(booking.getTotalPrice() + booking.getSecurityDeposit())
                        .paymentMethod(booking.getPaymentMethod())
                        .transactionRef("CAN_" + System.currentTimeMillis())
                        .status("REFUNDED")
                        .build());
            }

            User alertUser = isRenter ? product.getOwner() : booking.getRenter();
            notificationRepository.save(Notification.builder()
                    .user(alertUser)
                    .title("Booking Cancelled")
                    .message("The booking for '" + product.getTitle() + "' has been cancelled.")
                    .type("BOOKING_CANCELLED")
                    .build());
        }

        bookingRepository.save(booking);
        return ResponseEntity.ok(mapToDTO(booking));
    }

    @PutMapping("/{id}/extend")
    public ResponseEntity<?> extendBooking(@PathVariable Long id, @RequestParam LocalDate newEndDate, Principal principal) {
        User user = userRepository.findByUsername(principal.getName()).orElseThrow();
        Booking booking = bookingRepository.findById(id).orElseThrow();

        if (!booking.getRenter().getId().equals(user.getId())) {
            return ResponseEntity.status(403).body("Only the renter can extend this booking.");
        }

        if (newEndDate.isBefore(booking.getEndDate())) {
            return ResponseEntity.badRequest().body("New end date must be after current end date!");
        }

        // Check scheduling conflicts for the extension period
        List<Booking> activeBookings = bookingRepository.findByProductId(booking.getProduct().getId());
        for (Booking b : activeBookings) {
            if (!b.getId().equals(booking.getId()) && !b.getStatus().equals("CANCELLED") && !b.getStatus().equals("RETURNED")) {
                if (!(newEndDate.isBefore(b.getStartDate()) || booking.getEndDate().plusDays(1).isAfter(b.getEndDate()))) {
                    return ResponseEntity.badRequest().body("Cannot extend booking due to a scheduling conflict with another renter!");
                }
            }
        }

        long currentDays = ChronoUnit.DAYS.between(booking.getStartDate(), booking.getEndDate()) + 1;
        long newDays = ChronoUnit.DAYS.between(booking.getStartDate(), newEndDate) + 1;
        long extraDays = newDays - currentDays;

        double extraPrice = booking.getProduct().getPricePerDay() * extraDays;
        booking.setEndDate(newEndDate);
        booking.setTotalPrice(booking.getTotalPrice() + extraPrice);
        bookingRepository.save(booking);

        // Record extension payment ledger
        paymentRepository.save(Payment.builder()
                .booking(booking)
                .amount(extraPrice)
                .paymentMethod(booking.getPaymentMethod())
                .transactionRef("EXT_" + System.currentTimeMillis())
                .status("PAID")
                .build());

        // Notify owner
        notificationRepository.save(Notification.builder()
                .user(booking.getProduct().getOwner())
                .title("Rental Extended")
                .message("The renter extended '" + booking.getProduct().getTitle() + "' until " + newEndDate + ". Extra earnings: $" + extraPrice)
                .type("NEW_MESSAGE")
                .build());

        return ResponseEntity.ok(mapToDTO(booking));
    }

    @GetMapping("/product/{productId}")
    public ResponseEntity<List<BookingDTO>> getProductBookings(@PathVariable Long productId) {
        List<BookingDTO> list = bookingRepository.findByProductId(productId).stream()
                .filter(b -> !b.getStatus().equalsIgnoreCase("CANCELLED"))
                .map(this::mapToDTO)
                .collect(Collectors.toList());
        return ResponseEntity.ok(list);
    }

    private BookingDTO mapToDTO(Booking booking) {
        String firstUrl = "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=800";
        if (booking.getProduct().getImages() != null && !booking.getProduct().getImages().isEmpty()) {
            firstUrl = booking.getProduct().getImages().get(0).getImageUrl();
        }

        return BookingDTO.builder()
                .id(booking.getId())
                .productId(booking.getProduct().getId())
                .productTitle(booking.getProduct().getTitle())
                .productBrand(booking.getProduct().getBrand())
                .productModel(booking.getProduct().getModel())
                .productPrice(booking.getProduct().getPricePerDay())
                .securityDeposit(booking.getSecurityDeposit())
                .firstImageUrl(firstUrl)
                .renterId(booking.getRenter().getId())
                .renterName(booking.getRenter().getFullName())
                .startDate(booking.getStartDate())
                .endDate(booking.getEndDate())
                .totalPrice(booking.getTotalPrice())
                .status(booking.getStatus())
                .paymentMethod(booking.getPaymentMethod())
                .paymentStatus(booking.getPaymentStatus())
                .createdAt(booking.getCreatedAt())
                .build();
    }
}
