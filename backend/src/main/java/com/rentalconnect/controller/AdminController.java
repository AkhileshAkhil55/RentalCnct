package com.rentalconnect.controller;

import com.rentalconnect.dto.AdminStatsDTO;
import com.rentalconnect.dto.ProductDTO;
import com.rentalconnect.dto.UserProfileDTO;
import com.rentalconnect.entity.Booking;
import com.rentalconnect.entity.Product;
import com.rentalconnect.entity.ProductImage;
import com.rentalconnect.entity.User;
import com.rentalconnect.repository.BookingRepository;
import com.rentalconnect.repository.ProductRepository;
import com.rentalconnect.repository.ReviewRepository;
import com.rentalconnect.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/admin")
public class AdminController {

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private ProductRepository productRepository;

    @Autowired
    private BookingRepository bookingRepository;

    @Autowired
    private ReviewRepository reviewRepository;

    @GetMapping("/stats")
    public ResponseEntity<AdminStatsDTO> getDashboardStats() {
        long totalUsers = userRepository.count();
        long totalProducts = productRepository.count();
        long totalBookings = bookingRepository.count();
        
        double totalRevenue = bookingRepository.findAll().stream()
                .filter(b -> b.getPaymentStatus().equalsIgnoreCase("PAID") || b.getPaymentStatus().equalsIgnoreCase("REFUNDED"))
                .mapToDouble(Booking::getTotalPrice)
                .sum();
        
        long pendingCount = productRepository.findByStatus("PENDING_APPROVAL").size();
        
        long activeRentals = bookingRepository.findAll().stream()
                .filter(b -> b.getStatus().equalsIgnoreCase("ACTIVE"))
                .count();

        // Grouping by Category distribution
        Map<String, Long> categoryDistribution = productRepository.findAll().stream()
                .collect(Collectors.groupingBy(p -> p.getCategory().getName(), Collectors.counting()));

        // Simulated Monthly Earnings trend
        Map<String, Double> monthlyEarnings = new LinkedHashMap<>();
        monthlyEarnings.put("Mar", totalRevenue * 0.15);
        monthlyEarnings.put("Apr", totalRevenue * 0.22);
        monthlyEarnings.put("May", totalRevenue * 0.18);
        monthlyEarnings.put("Jun", totalRevenue * 0.25);
        monthlyEarnings.put("Jul", totalRevenue * 0.20);
        
        return ResponseEntity.ok(AdminStatsDTO.builder()
                .totalUsers(totalUsers)
                .totalProducts(totalProducts)
                .totalBookings(totalBookings)
                .totalRevenue(totalRevenue)
                .pendingListingsCount(pendingCount)
                .activeRentalsCount(activeRentals)
                .categoryDistribution(categoryDistribution)
                .monthlyEarnings(monthlyEarnings)
                .build());
    }

    @GetMapping("/users")
    public ResponseEntity<List<UserProfileDTO>> getAllUsers() {
        List<UserProfileDTO> users = userRepository.findAll().stream()
                .map(u -> UserProfileDTO.builder()
                        .id(u.getId())
                        .username(u.getUsername())
                        .email(u.getEmail())
                        .fullName(u.getFullName())
                        .phone(u.getPhone())
                        .avatar(u.getAvatar())
                        .role(u.getRole().name())
                        .build())
                .collect(Collectors.toList());
        return ResponseEntity.ok(users);
    }

    @PutMapping("/users/{id}/role")
    public ResponseEntity<?> updateUserRole(@PathVariable Long id, @RequestParam String role) {
        User user = userRepository.findById(id).orElseThrow();
        user.setRole(com.rentalconnect.entity.Role.valueOf("ROLE_" + role.toUpperCase()));
        userRepository.save(user);
        return ResponseEntity.ok("User role updated successfully!");
    }

    @GetMapping("/products")
    public ResponseEntity<List<ProductDTO>> getAllProductsAdmin() {
        List<ProductDTO> products = productRepository.findAll().stream()
                .map(this::mapToDTO)
                .collect(Collectors.toList());
        return ResponseEntity.ok(products);
    }

    @PutMapping("/products/{id}/status")
    public ResponseEntity<?> approveProduct(@PathVariable Long id, @RequestParam String status) {
        Product product = productRepository.findById(id).orElseThrow();
        product.setStatus(status.toUpperCase()); // APPROVED, REJECTED, SUSPENDED
        productRepository.save(product);
        return ResponseEntity.ok("Product status updated to " + status + "!");
    }

    @DeleteMapping("/reviews/{id}")
    public ResponseEntity<?> deleteReviewAdmin(@PathVariable Long id) {
        reviewRepository.deleteById(id);
        return ResponseEntity.ok("Review deleted by Administrator.");
    }

    private ProductDTO mapToDTO(Product product) {
        return ProductDTO.builder()
                .id(product.getId())
                .title(product.getTitle())
                .brand(product.getBrand())
                .model(product.getModel())
                .description(product.getDescription())
                .categoryId(product.getCategory().getId())
                .categoryName(product.getCategory().getName())
                .ownerId(product.getOwner().getId())
                .ownerName(product.getOwner().getFullName())
                .ownerRating(4.8)
                .pricePerDay(product.getPricePerDay())
                .securityDeposit(product.getSecurityDeposit())
                .pickupLocation(product.getPickupLocation())
                .deliveryAvailable(product.isDeliveryAvailable())
                .itemCondition(product.getItemCondition())
                .specifications(product.getSpecifications())
                .averageRating(product.getAverageRating())
                .status(product.getStatus())
                .imageUrls(product.getImages().stream().map(ProductImage::getImageUrl).collect(Collectors.toList()))
                .build();
    }
}
