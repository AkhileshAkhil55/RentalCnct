package com.rentalconnect.loader;

import com.rentalconnect.entity.*;
import com.rentalconnect.repository.*;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.Arrays;
import java.util.List;

@Component
public class DataLoader implements CommandLineRunner {

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private AddressRepository addressRepository;

    @Autowired
    private CategoryRepository categoryRepository;

    @Autowired
    private ProductRepository productRepository;

    @Autowired
    private BookingRepository bookingRepository;

    @Autowired
    private ReviewRepository reviewRepository;

    @Autowired
    private NotificationRepository notificationRepository;

    @Autowired
    private ChatRepository chatRepository;

    @Autowired
    private MessageRepository messageRepository;

    @Autowired
    private PaymentRepository paymentRepository;

    @Autowired
    private PasswordEncoder passwordEncoder;

    @Override
    public void run(String... args) throws Exception {
        if (userRepository.count() > 0) {
            // Already seeded
            return;
        }

        // 1. Create Users (Admin, Renter, and 5 Dummy Sellers)
        String pass = passwordEncoder.encode("password123");
        
        User admin = User.builder()
                .username("admin")
                .email("admin@rentalconnect.com")
                .fullName("Admin Manager")
                .phone("+15550001")
                .password(pass)
                .role(Role.ROLE_ADMIN)
                .avatar("https://api.dicebear.com/7.x/bottts/svg?seed=admin")
                .build();
        userRepository.save(admin);

        User renter = User.builder()
                .username("renter")
                .email("renter@gmail.com")
                .fullName("John Doe")
                .phone("+15551111")
                .password(pass)
                .role(Role.ROLE_USER)
                .avatar("https://api.dicebear.com/7.x/adventurer/svg?seed=renter")
                .build();
        userRepository.save(renter);

        addressRepository.save(Address.builder()
                .user(renter)
                .street("742 Evergreen Terrace")
                .city("Springfield")
                .state("IL")
                .zipCode("62704")
                .country("USA")
                .isDefault(true)
                .build());

        // Dummy Sellers
        User alex = User.builder()
                .username("alex")
                .email("alex@rentalconnect.com")
                .fullName("Alex Rivera")
                .phone("+15552222")
                .password(pass)
                .role(Role.ROLE_USER)
                .avatar("https://api.dicebear.com/7.x/avataaars/svg?seed=alex")
                .build();
        userRepository.save(alex);
        
        addressRepository.save(Address.builder()
                .user(alex)
                .street("123 Broadway St")
                .city("New York")
                .state("NY")
                .zipCode("10001")
                .country("USA")
                .isDefault(true)
                .build());

        User sarah = User.builder()
                .username("sarah")
                .email("sarah@rentalconnect.com")
                .fullName("Sarah Jenkins")
                .phone("+15553333")
                .password(pass)
                .role(Role.ROLE_USER)
                .avatar("https://api.dicebear.com/7.x/avataaars/svg?seed=sarah")
                .build();
        userRepository.save(sarah);

        User david = User.builder()
                .username("david")
                .email("david@rentalconnect.com")
                .fullName("David Chen")
                .phone("+15554444")
                .password(pass)
                .role(Role.ROLE_USER)
                .avatar("https://api.dicebear.com/7.x/avataaars/svg?seed=david")
                .build();
        userRepository.save(david);

        User elena = User.builder()
                .username("elena")
                .email("elena@rentalconnect.com")
                .fullName("Elena Rostova")
                .phone("+15555555")
                .password(pass)
                .role(Role.ROLE_USER)
                .avatar("https://api.dicebear.com/7.x/avataaars/svg?seed=elena")
                .build();
        userRepository.save(elena);

        User marcus = User.builder()
                .username("marcus")
                .email("marcus@rentalconnect.com")
                .fullName("Marcus Vance")
                .phone("+15556666")
                .password(pass)
                .role(Role.ROLE_USER)
                .avatar("https://api.dicebear.com/7.x/avataaars/svg?seed=marcus")
                .build();
        userRepository.save(marcus);

        // 2. Create Categories
        List<Category> categories = new ArrayList<>();
        categories.add(Category.builder().name("Speakers").icon("Volume2").description("Premium sound systems, Bluetooth speakers, and subwoofers.").build());
        categories.add(Category.builder().name("DSLR Cameras").icon("Camera").description("High-end DSLR and mirrorless camera bodies for professional shots.").build());
        categories.add(Category.builder().name("Action Cameras").icon("Video").description("Compact, rugged action cams to shoot sports and adventures.").build());
        categories.add(Category.builder().name("Camping Equipment").icon("Compass").description("Backpacking stoves, coolers, backpacks, and safety gear.").build());
        categories.add(Category.builder().name("Tents").icon("Tent").description("Family, dome, and ultra-lightweight tents.").build());
        categories.add(Category.builder().name("Cycles").icon("Bike").description("Hybrid, city, and commuter bicycles for daily rental.").build());
        categories.add(Category.builder().name("Mountain Bikes").icon("Mountain").description("Tough offroad bikes with strong suspension and thick tires.").build());
        categories.add(Category.builder().name("Gaming Consoles").icon("Gamepad2").description("PlayStation, Xbox, and Nintendo Switch devices.").build());
        categories.add(Category.builder().name("Laptops").icon("Laptop").description("High-speed gaming, business, and production laptops.").build());
        categories.add(Category.builder().name("Projectors").icon("Tv").description("Ultra-bright office and home theater projectors.").build());
        categories.add(Category.builder().name("Drone Cameras").icon("Plane").description("Quadcopter drone cameras with high-res stabilization.").build());
        categories.add(Category.builder().name("Power Tools").icon("Hammer").description("Drills, impact drivers, saws, and heavy masonry tools.").build());
        categories.add(Category.builder().name("Party Items").icon("Sparkles").description("Disco lights, fog machines, mic kits, and balloon pumps.").build());
        categories.add(Category.builder().name("Musical Instruments").icon("Music").description("Electric guitars, keyboards, violins, and drum kits.").build());
        categories.add(Category.builder().name("Fitness Equipment").icon("Dumbbell").description("Adjustable dumbbells, yoga blocks, and portable treadmills.").build());
        categories.add(Category.builder().name("Kitchen Appliances").icon("Coffee").description("Coffee machines, air fryers, multi-cookers, and blenders.").build());
        categories.add(Category.builder().name("Home Appliances").icon("Home").description("Steam ironers, vacuum cleaners, and humidifiers.").build());
        categories.add(Category.builder().name("Photography Lights").icon("Sun").description("Ring lights, studio softboxes, and tripod flash sets.").build());
        categories.add(Category.builder().name("Microphones").icon("Mic").description("Studio condensers, podcasting dynamics, and wireless lapels.").build());
        categories.add(Category.builder().name("Generators").icon("Zap").description("Portable gasoline backup generators for outdoor backup power.").build());
        categories.add(Category.builder().name("Garden Equipment").icon("Leaf").description("Lawn mowers, leaf blowers, hedge trimmers, and pressure washers.").build());
        categories.add(Category.builder().name("Sports Equipment").icon("Trophy").description("Tennis rackets, cricket bats, skateboards, and helmets.").build());
        categories.add(Category.builder().name("Fishing Equipment").icon("Anchor").description("Spinning rods, fishing reels, nets, and tackle sets.").build());
        categories.add(Category.builder().name("Travel Accessories").icon("Briefcase").description("Luggage, neck pillows, travel adapters, and action mounts.").build());

        categoryRepository.saveAll(categories);

        // Fetch saved references
        Category speakersCat = categoryRepository.findByName("Speakers").orElseThrow();
        Category dslrCat = categoryRepository.findByName("DSLR Cameras").orElseThrow();
        Category actionCat = categoryRepository.findByName("Action Cameras").orElseThrow();
        Category tentsCat = categoryRepository.findByName("Tents").orElseThrow();
        Category mtbCat = categoryRepository.findByName("Mountain Bikes").orElseThrow();
        Category consolesCat = categoryRepository.findByName("Gaming Consoles").orElseThrow();
        Category laptopsCat = categoryRepository.findByName("Laptops").orElseThrow();
        Category projectorsCat = categoryRepository.findByName("Projectors").orElseThrow();
        Category droneCat = categoryRepository.findByName("Drone Cameras").orElseThrow();
        Category toolsCat = categoryRepository.findByName("Power Tools").orElseThrow();
        Category instrumentsCat = categoryRepository.findByName("Musical Instruments").orElseThrow();
        Category genCat = categoryRepository.findByName("Generators").orElseThrow();

        // 3. Create Products for Sellers
        List<Product> products = new ArrayList<>();

        // Alex's gear (Alex Rivera)
        Product sony = Product.builder()
                .title("Sony Alpha 7 IV Mirrorless Camera")
                .brand("Sony")
                .model("A7 IV")
                .description("Get stunning hybrid image quality with the new 33MP sensor, advanced autofocus, and 4K60p video capture. Comes with a 24-70mm f/2.8 lens, 2 batteries, and a charger. Perfect for events and professional shoots.")
                .category(dslrCat)
                .owner(alex)
                .pricePerDay(45.0)
                .securityDeposit(300.0)
                .pickupLocation("Downtown Manhattan, NY")
                .deliveryAvailable(true)
                .itemCondition("Excellent")
                .specifications("{\"Sensor\":\"33MP Full-Frame Exmor R CMOS\",\"Autofocus\":\"759-Point Phase Detection\",\"Video\":\"4K 60p 10-Bit 4:2:2\",\"Lens\":\"Sigma 24-70mm f/2.8 DG DN\"}")
                .averageRating(4.9)
                .status("APPROVED")
                .build();
        sony.addImage(ProductImage.builder().imageUrl("https://images.unsplash.com/photo-1616440347437-b1c73416efc2?w=800").build());
        sony.addImage(ProductImage.builder().imageUrl("https://images.unsplash.com/photo-1516035069371-29a1b244cc32?w=800").build());
        products.add(sony);

        Product dji = Product.builder()
                .title("DJI Mavic 3 Pro Drone")
                .brand("DJI")
                .model("Mavic 3 Pro")
                .description("Capture breathtaking landscapes from the sky with a triple-camera system featuring Hasselblad 4/3 optics. Includes Fly More Combo: smart controller, 3 batteries, multi-charger, and a protective carrying case.")
                .category(droneCat)
                .owner(alex)
                .pricePerDay(65.0)
                .securityDeposit(500.0)
                .pickupLocation("Downtown Manhattan, NY")
                .deliveryAvailable(true)
                .itemCondition("Excellent")
                .specifications("{\"Max Flight Time\":\"43 Minutes\",\"Transmission Range\":\"15 km (O3+)\",\"Camera\":\"Hasselblad 4/3 CMOS + Dual Tele Cameras\",\"Video Resolution\":\"5.1K/50fps, 4K/120fps\"}")
                .averageRating(4.8)
                .status("APPROVED")
                .build();
        dji.addImage(ProductImage.builder().imageUrl("https://images.unsplash.com/photo-1527977966376-1c8408f9f108?w=800").build());
        products.add(dji);

        Product gopro = Product.builder()
                .title("GoPro Hero 12 Black Action Camera")
                .brand("GoPro")
                .model("Hero 12 Black")
                .description("Shoot stable 5.3K video in extreme conditions with HyperSmooth 6.0 stabilization. Comes with mounting bracket, chest strap, helmet mount, and 2 enduro batteries.")
                .category(actionCat)
                .owner(alex)
                .pricePerDay(15.0)
                .securityDeposit(100.0)
                .pickupLocation("Downtown Manhattan, NY")
                .deliveryAvailable(false)
                .itemCondition("Good")
                .specifications("{\"Video Resolution\":\"5.3K60, 4K120\",\"Waterproof\":\"Up to 10m (33ft) without housing\",\"Stabilization\":\"HyperSmooth 6.0 with AutoBoost\",\"Photo Resolution\":\"27 MP\"}")
                .averageRating(4.7)
                .status("APPROVED")
                .build();
        gopro.addImage(ProductImage.builder().imageUrl("https://images.unsplash.com/photo-1565538810844-1e1194116c07?w=800").build());
        products.add(gopro);

        // Sarah's Gear (Sarah Jenkins)
        Product tent = Product.builder()
                .title("Coleman 4-Person Instant Cabin Tent")
                .brand("Coleman")
                .model("Cabin 4P")
                .description("Setup camp in under 60 seconds. WeatherTec double-thick fabric handles wind and rain. Fully spacious enough for one queen airbed.")
                .category(tentsCat)
                .owner(sarah)
                .pricePerDay(12.0)
                .securityDeposit(50.0)
                .pickupLocation("Green Valley, Springfield")
                .deliveryAvailable(true)
                .itemCondition("Good")
                .specifications("{\"Capacity\":\"4 Person\",\"Dimensions\":\"8 x 7 ft\",\"Center Height\":\"4 ft 11 in\",\"Setup Time\":\"60 seconds\"}")
                .averageRating(4.6)
                .status("APPROVED")
                .build();
        tent.addImage(ProductImage.builder().imageUrl("https://images.unsplash.com/photo-1510312305653-8ed496efae75?w=800").build());
        products.add(tent);

        Product trekBike = Product.builder()
                .title("Trek Marlin 7 Mountain Bike")
                .brand("Trek")
                .model("Marlin 7")
                .description("A race-worthy cross country mountain bike. The RockShox fork, 1x drivetrain, and Shimano hydraulic brakes make it a stellar choice for trail riding and city cruising.")
                .category(mtbCat)
                .owner(sarah)
                .pricePerDay(25.0)
                .securityDeposit(150.0)
                .pickupLocation("Green Valley, Springfield")
                .deliveryAvailable(false)
                .itemCondition("Excellent")
                .specifications("{\"Frame\":\"Alpha Silver Aluminum, internal routing\",\"Fork\":\"RockShox Judy, coil spring, preload, lockout\",\"Drivetrain\":\"Shimano Deore M4100, 10-speed\",\"Size\":\"Medium (fits 5'6\\\" to 5'10\\\")\"}")
                .averageRating(4.8)
                .status("APPROVED")
                .build();
        trekBike.addImage(ProductImage.builder().imageUrl("https://images.unsplash.com/photo-1485965120184-e220f721d03e?w=800").build());
        products.add(trekBike);

        // David's Gear (David Chen)
        Product ps5 = Product.builder()
                .title("PlayStation 5 Slim Console")
                .brand("Sony")
                .model("PS5 Slim")
                .description("Experience lightning-fast loading with an ultra-high speed SSD, deeper immersion with haptic feedback support, and 3D Audio. Pre-loaded with two DualSense controllers. Ready to plug and play.")
                .category(consolesCat)
                .owner(david)
                .pricePerDay(20.0)
                .securityDeposit(150.0)
                .pickupLocation("Tech District, San Jose")
                .deliveryAvailable(true)
                .itemCondition("Excellent")
                .specifications("{\"Storage\":\"1TB Custom SSD\",\"Resolution\":\"Up to 4K 120fps\",\"Controllers Included\":\"2 DualSense Wireless\",\"Included Games\":\"FC 24, Marvel's Spider-Man 2\"}")
                .averageRating(4.9)
                .status("APPROVED")
                .build();
        ps5.addImage(ProductImage.builder().imageUrl("https://images.unsplash.com/photo-1606813907291-d86efa9b94db?w=800").build());
        products.add(ps5);

        Product rogLaptop = Product.builder()
                .title("ASUS ROG Zephyrus G14 Gaming Laptop")
                .brand("ASUS")
                .model("ROG G14")
                .description("High-performance gaming on the go. Featuring AMD Ryzen 9 processor and RTX 4060 graphics cards. ROG Nebula HDR display renders games in crisp detail.")
                .category(laptopsCat)
                .owner(david)
                .pricePerDay(40.0)
                .securityDeposit(350.0)
                .pickupLocation("Tech District, San Jose")
                .deliveryAvailable(true)
                .itemCondition("Excellent")
                .specifications("{\"Processor\":\"AMD Ryzen 9 7940HS\",\"Graphics Card\":\"NVIDIA GeForce RTX 4060 8GB\",\"RAM\":\"16GB DDR5 4800MHz\",\"Storage\":\"1TB PCIe 4.0 NVMe SSD\",\"Screen\":\"14\\\" QHD+ 165Hz Nebula Display\"}")
                .averageRating(4.8)
                .status("APPROVED")
                .build();
        rogLaptop.addImage(ProductImage.builder().imageUrl("https://images.unsplash.com/photo-1588872657578-7efd1f1555ed?w=800").build());
        products.add(rogLaptop);

        Product projector = Product.builder()
                .title("Epson Home Cinema 2350 4K Projector")
                .brand("Epson")
                .model("Cinema 2350")
                .description("Turn any blank wall into a 150-inch 4K theater screen. 2,800 Lumens provides bright colors even with ambient light. Smart Android TV streaming included.")
                .category(projectorsCat)
                .owner(david)
                .pricePerDay(30.0)
                .securityDeposit(200.0)
                .pickupLocation("Tech District, San Jose")
                .deliveryAvailable(false)
                .itemCondition("Excellent")
                .specifications("{\"Brightness\":\"2,800 Lumens\",\"Resolution\":\"4K PRO-UHD (3840x2160)\",\"Contrast Ratio\":\"100,000:1\",\"Inputs\":\"2x HDMI 2.0, Audio Out\"}")
                .averageRating(4.7)
                .status("APPROVED")
                .build();
        projector.addImage(ProductImage.builder().imageUrl("https://images.unsplash.com/photo-1535016120720-40c646be5580?w=800").build());
        products.add(projector);

        // Elena's Gear (Elena Rostova)
        Product drill = Product.builder()
                .title("DeWalt 20V Cordless Drill & Driver Kit")
                .brand("DeWalt")
                .model("DCK240C2")
                .description("Includes a compact drill/driver and an impact driver. Heavy-duty tools that deliver high torque and long battery runtime. Perfect for home renovations and light commercial repairs.")
                .category(toolsCat)
                .owner(elena)
                .pricePerDay(10.0)
                .securityDeposit(60.0)
                .pickupLocation("Industrial Zone, Detroit")
                .deliveryAvailable(true)
                .itemCondition("Good")
                .specifications("{\"Voltage\":\"20V MAX\",\"Battery Type\":\"Lithium-Ion (2x 1.3Ah included)\",\"Drill Chuck Size\":\"1/2\\\"\",\"Impact Driver Torque\":\"1400 in-lbs\"}")
                .averageRating(4.5)
                .status("APPROVED")
                .build();
        drill.addImage(ProductImage.builder().imageUrl("https://images.unsplash.com/photo-1504148455328-c376907d081c?w=800").build());
        products.add(drill);

        Product generator = Product.builder()
                .title("Honda EU2200i Companion Inverter Generator")
                .brand("Honda")
                .model("EU2200i")
                .description("Incredibly quiet portable power generator. Produces 2200 Peak Watts of clean power, safe for laptops and electronic gear. Ideal for tailgating, camping, and home emergency backup.")
                .category(genCat)
                .owner(elena)
                .pricePerDay(35.0)
                .securityDeposit(250.0)
                .pickupLocation("Industrial Zone, Detroit")
                .deliveryAvailable(false)
                .itemCondition("Good")
                .specifications("{\"Max Power Output\":\"2200 Watts\",\"Running Output\":\"1800 Watts\",\"Fuel Capacity\":\"0.95 Gallons\",\"Noise Level\":\"48 to 57 dBA\"}")
                .averageRating(4.8)
                .status("APPROVED")
                .build();
        generator.addImage(ProductImage.builder().imageUrl("https://images.unsplash.com/photo-1590372648787-bf53d26210f9?w=800").build());
        products.add(generator);

        // Marcus's Gear (Marcus Vance)
        Product partybox = Product.builder()
                .title("JBL PartyBox 310 Bluetooth Speaker")
                .brand("JBL")
                .model("PartyBox 310")
                .description("Huge JBL Pro Sound with 240 watts of power, synced light shows, and dual mic/guitar inputs for karaoke night. Built-in wheels and handle for easy transportation.")
                .category(speakersCat)
                .owner(marcus)
                .pricePerDay(28.0)
                .securityDeposit(180.0)
                .pickupLocation("Metro Center, Seattle")
                .deliveryAvailable(true)
                .itemCondition("Excellent")
                .specifications("{\"Output Power\":\"240W RMS\",\"Battery Runtime\":\"Up to 18 Hours\",\"Water Protection\":\"IPX4 Splashproof\",\"Connectivity\":\"Bluetooth 5.1, USB, AUX, Mic/Guitar In\"}")
                .averageRating(4.9)
                .status("APPROVED")
                .build();
        partybox.addImage(ProductImage.builder().imageUrl("https://images.unsplash.com/photo-1608043152269-423dbba4e7e1?w=800").build());
        products.add(partybox);

        Product guitar = Product.builder()
                .title("Fender Stratocaster Electric Guitar")
                .brand("Fender")
                .model("Player Stratocaster")
                .description("The inspiring sound of a Stratocaster is one of the foundations of Fender. Featuring classic bell-like high end, punchy mids, and robust low end. Rental includes soft bag, picks, strap, and a 15W Fender practice amp.")
                .category(instrumentsCat)
                .owner(marcus)
                .pricePerDay(22.0)
                .securityDeposit(150.0)
                .pickupLocation("Metro Center, Seattle")
                .deliveryAvailable(false)
                .itemCondition("Excellent")
                .specifications("{\"Body Type\":\"Solid Body Alder\",\"Neck Material\":\"Maple, modern 'C' shape\",\"Scale Length\":\"25.5\\\"\",\"Pickups\":\"3x Player Series Alnico 5 Strat Single-Coil\"}")
                .averageRating(4.9)
                .status("APPROVED")
                .build();
        guitar.addImage(ProductImage.builder().imageUrl("https://images.unsplash.com/photo-1550291652-6ea9114a47b1?w=800").build());
        products.add(guitar);

        productRepository.saveAll(products);

        // 4. Seed Reviews on Products
        reviewRepository.save(Review.builder().product(sony).reviewer(renter).rating(5).comment("Absolutely brilliant camera! Shot a wedding this weekend, autofocus was incredibly sharp. Alex was super communicative and pick up was smooth.").build());
        reviewRepository.save(Review.builder().product(sony).reviewer(david).rating(5).comment("Clean sensor, lens works perfectly. Recommended!").build());
        reviewRepository.save(Review.builder().product(dji).reviewer(renter).rating(5).comment("Flew this around the lake. Hasselblad camera is mindblowing. Clean unit, fully charged batteries.").build());
        reviewRepository.save(Review.builder().product(ps5).reviewer(renter).rating(5).comment("Rented for a weekend sleepover with kids. Perfect shape, controllers were fully functional.").build());
        reviewRepository.save(Review.builder().product(trekBike).reviewer(renter).rating(4).comment("Bicycle rides very smoothly. There were a couple of scratches on the frame but mechanical parts were 100% fine.").build());

        // 5. Seed Bookings (1 Returned, 1 Confirmed)
        Booking returnedBooking = Booking.builder()
                .product(sony)
                .renter(renter)
                .startDate(LocalDate.now().minusDays(10))
                .endDate(LocalDate.now().minusDays(7))
                .totalPrice(135.0)
                .securityDeposit(300.0)
                .status("RETURNED")
                .paymentMethod("STRIPE")
                .paymentStatus("REFUNDED")
                .build();
        bookingRepository.save(returnedBooking);
        
        paymentRepository.save(Payment.builder()
                .booking(returnedBooking)
                .amount(435.0)
                .paymentMethod("STRIPE")
                .transactionRef("TXN_109827361")
                .status("PAID")
                .build());

        Booking confirmedBooking = Booking.builder()
                .product(ps5)
                .renter(renter)
                .startDate(LocalDate.now().plusDays(2))
                .endDate(LocalDate.now().plusDays(5))
                .totalPrice(60.0)
                .securityDeposit(150.0)
                .status("CONFIRMED")
                .paymentMethod("UPI")
                .paymentStatus("PAID")
                .build();
        bookingRepository.save(confirmedBooking);

        paymentRepository.save(Payment.builder()
                .booking(confirmedBooking)
                .amount(210.0)
                .paymentMethod("UPI")
                .transactionRef("TXN_987216355")
                .status("PAID")
                .build());

        // 6. Seed Chats & Messages
        Chat chat1 = Chat.builder()
                .buyer(renter)
                .seller(alex)
                .product(dji)
                .build();
        chatRepository.save(chat1);

        List<Message> msgs = Arrays.asList(
                Message.builder().chat(chat1).sender(renter).messageText("Hey Alex! I want to rent your DJI Mavic 3 drone next weekend. Is it fully functional?").build(),
                Message.builder().chat(chat1).sender(alex).messageText("Hi John! Yes, it works perfectly and is fully loaded with extra batteries and ND filters. Have you flown drones before?").build(),
                Message.builder().chat(chat1).sender(renter).messageText("Yes, I have an older model but wanted to try this one for a landscape shoot. Does it come with a micro SD card?").build(),
                Message.builder().chat(chat1).sender(alex).messageText("Yes, a 128GB high-speed card is included! You can place the booking request and I will approve it.").build()
        );
        messageRepository.saveAll(msgs);

        // Update chat messages reference list
        chat1.getMessages().addAll(msgs);
        chatRepository.save(chat1);
        
        // Save alert notifications
        notificationRepository.save(Notification.builder()
                .user(renter)
                .title("Welcome to RentalConnect!")
                .message("You can now browse products, register listings, chat with owners, and enjoy seamless bookings.")
                .type("NEW_MESSAGE")
                .build());
    }
}
