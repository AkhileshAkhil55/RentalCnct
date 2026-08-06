package com.rentalconnect.controller;

import com.rentalconnect.dto.CategoryDTO;
import com.rentalconnect.dto.ProductDTO;
import com.rentalconnect.dto.ReviewDTO;
import com.rentalconnect.entity.Category;
import com.rentalconnect.entity.Product;
import com.rentalconnect.entity.ProductImage;
import com.rentalconnect.entity.Review;
import com.rentalconnect.entity.User;
import com.rentalconnect.repository.CategoryRepository;
import com.rentalconnect.repository.ProductRepository;
import com.rentalconnect.repository.ReviewRepository;
import com.rentalconnect.repository.UserRepository;
import jakarta.persistence.criteria.Predicate;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.security.Principal;
import java.util.ArrayList;
import java.util.List;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api")
public class ProductController {

    @Autowired
    private ProductRepository productRepository;

    @Autowired
    private CategoryRepository categoryRepository;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private ReviewRepository reviewRepository;

    @GetMapping("/categories")
    public ResponseEntity<List<CategoryDTO>> getAllCategories() {
        List<CategoryDTO> categories = categoryRepository.findAll().stream()
                .map(cat -> CategoryDTO.builder()
                        .id(cat.getId())
                        .name(cat.getName())
                        .icon(cat.getIcon())
                        .description(cat.getDescription())
                        .build())
                .collect(Collectors.toList());
        return ResponseEntity.ok(categories);
    }

    @GetMapping("/products")
    public ResponseEntity<List<ProductDTO>> searchProducts(
            @RequestParam(required = false) String search,
            @RequestParam(required = false) Long categoryId,
            @RequestParam(required = false) Double minPrice,
            @RequestParam(required = false) Double maxPrice,
            @RequestParam(required = false) String location,
            @RequestParam(required = false) Double rating,
            @RequestParam(required = false) String condition,
            @RequestParam(required = false) String brand,
            @RequestParam(required = false) Boolean delivery
    ) {
        Specification<Product> spec = (root, query, cb) -> {
            List<Predicate> predicates = new ArrayList<>();

            // Publicly searchable products should only be APPROVED ones
            predicates.add(cb.equal(root.get("status"), "APPROVED"));

            if (search != null && !search.trim().isEmpty()) {
                String searchPattern = "%" + search.toLowerCase().trim() + "%";
                Predicate titlePred = cb.like(cb.lower(root.get("title")), searchPattern);
                Predicate brandPred = cb.like(cb.lower(root.get("brand")), searchPattern);
                Predicate modelPred = cb.like(cb.lower(root.get("model")), searchPattern);
                Predicate descPred = cb.like(cb.lower(root.get("description")), searchPattern);
                predicates.add(cb.or(titlePred, brandPred, modelPred, descPred));
            }

            if (categoryId != null) {
                predicates.add(cb.equal(root.get("category").get("id"), categoryId));
            }

            if (minPrice != null) {
                predicates.add(cb.greaterThanOrEqualTo(root.get("pricePerDay"), minPrice));
            }

            if (maxPrice != null) {
                predicates.add(cb.lessThanOrEqualTo(root.get("pricePerDay"), maxPrice));
            }

            if (location != null && !location.trim().isEmpty()) {
                predicates.add(cb.like(cb.lower(root.get("pickupLocation")), "%" + location.toLowerCase() + "%"));
            }

            if (rating != null) {
                predicates.add(cb.greaterThanOrEqualTo(root.get("averageRating"), rating));
            }

            if (condition != null && !condition.trim().isEmpty()) {
                predicates.add(cb.equal(cb.lower(root.get("itemCondition")), condition.toLowerCase()));
            }

            if (brand != null && !brand.trim().isEmpty()) {
                predicates.add(cb.equal(cb.lower(root.get("brand")), brand.toLowerCase()));
            }

            if (delivery != null) {
                predicates.add(cb.equal(root.get("deliveryAvailable"), delivery));
            }

            return cb.and(predicates.toArray(new Predicate[0]));
        };

        List<ProductDTO> products = productRepository.findAll(spec).stream()
                .map(this::mapToDTO)
                .collect(Collectors.toList());
        return ResponseEntity.ok(products);
    }

    @GetMapping("/products/{id}")
    public ResponseEntity<ProductDTO> getProductById(@PathVariable Long id) {
        Product product = productRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Product not found"));
        return ResponseEntity.ok(mapToDTO(product));
    }

    @GetMapping("/products/my-listings")
    public ResponseEntity<List<ProductDTO>> getMyListings(Principal principal) {
        User user = userRepository.findByUsername(principal.getName()).orElseThrow();
        List<ProductDTO> products = productRepository.findByOwnerId(user.getId()).stream()
                .map(this::mapToDTO)
                .collect(Collectors.toList());
        return ResponseEntity.ok(products);
    }

    @PostMapping("/products")
    public ResponseEntity<?> createProduct(@RequestBody ProductDTO dto, Principal principal) {
        User user = userRepository.findByUsername(principal.getName()).orElseThrow();
        Category category = categoryRepository.findById(dto.getCategoryId())
                .orElseThrow(() -> new RuntimeException("Category not found"));

        Product product = Product.builder()
                .title(dto.getTitle())
                .brand(dto.getBrand())
                .model(dto.getModel())
                .description(dto.getDescription())
                .category(category)
                .owner(user)
                .pricePerDay(dto.getPricePerDay())
                .securityDeposit(dto.getSecurityDeposit())
                .pickupLocation(dto.getPickupLocation())
                .deliveryAvailable(dto.isDeliveryAvailable())
                .itemCondition(dto.getItemCondition())
                .specifications(dto.getSpecifications())
                .averageRating(5.0) // initial rating
                .status("APPROVED") // Automatically approve in local mock database to skip admin step
                .build();

        if (dto.getImageUrls() != null && !dto.getImageUrls().isEmpty()) {
            for (String url : dto.getImageUrls()) {
                product.addImage(ProductImage.builder().imageUrl(url).build());
            }
        } else {
            // Default placeholder image
            product.addImage(ProductImage.builder()
                    .imageUrl("https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=800")
                    .build());
        }

        productRepository.save(product);
        return ResponseEntity.ok(mapToDTO(product));
    }

    @PutMapping("/products/{id}")
    public ResponseEntity<?> updateProduct(@PathVariable Long id, @RequestBody ProductDTO dto, Principal principal) {
        User user = userRepository.findByUsername(principal.getName()).orElseThrow();
        Product product = productRepository.findById(id).orElseThrow();

        if (!product.getOwner().getId().equals(user.getId()) && !user.getRole().name().equals("ROLE_ADMIN")) {
            return ResponseEntity.status(403).body("You are not authorized to update this listing.");
        }

        Category category = categoryRepository.findById(dto.getCategoryId()).orElseThrow();

        product.setTitle(dto.getTitle());
        product.setBrand(dto.getBrand());
        product.setModel(dto.getModel());
        product.setDescription(dto.getDescription());
        product.setCategory(category);
        product.setPricePerDay(dto.getPricePerDay());
        product.setSecurityDeposit(dto.getSecurityDeposit());
        product.setPickupLocation(dto.getPickupLocation());
        product.setDeliveryAvailable(dto.isDeliveryAvailable());
        product.setItemCondition(dto.getItemCondition());
        product.setSpecifications(dto.getSpecifications());

        if (dto.getImageUrls() != null) {
            product.getImages().clear();
            for (String url : dto.getImageUrls()) {
                product.addImage(ProductImage.builder().imageUrl(url).build());
            }
        }

        productRepository.save(product);
        return ResponseEntity.ok(mapToDTO(product));
    }

    @DeleteMapping("/products/{id}")
    public ResponseEntity<?> deleteProduct(@PathVariable Long id, Principal principal) {
        User user = userRepository.findByUsername(principal.getName()).orElseThrow();
        Product product = productRepository.findById(id).orElseThrow();

        if (!product.getOwner().getId().equals(user.getId()) && !user.getRole().name().equals("ROLE_ADMIN")) {
            return ResponseEntity.status(403).body("You are not authorized to delete this listing.");
        }

        productRepository.delete(product);
        return ResponseEntity.ok("Listing deleted successfully!");
    }

    @GetMapping("/products/{id}/reviews")
    public ResponseEntity<List<ReviewDTO>> getProductReviews(@PathVariable Long id) {
        List<ReviewDTO> reviews = reviewRepository.findByProductId(id).stream()
                .map(rev -> ReviewDTO.builder()
                        .id(rev.getId())
                        .productId(id)
                        .reviewerId(rev.getReviewer().getId())
                        .reviewerName(rev.getReviewer().getFullName())
                        .reviewerAvatar(rev.getReviewer().getAvatar())
                        .rating(rev.getRating())
                        .comment(rev.getComment())
                        .createdAt(rev.getCreatedAt())
                        .build())
                .collect(Collectors.toList());
        return ResponseEntity.ok(reviews);
    }

    @PostMapping("/products/{id}/reviews")
    public ResponseEntity<?> addProductReview(@PathVariable Long id, @RequestBody ReviewDTO dto, Principal principal) {
        User user = userRepository.findByUsername(principal.getName()).orElseThrow();
        Product product = productRepository.findById(id).orElseThrow();

        Review review = Review.builder()
                .product(product)
                .reviewer(user)
                .rating(dto.getRating())
                .comment(dto.getComment())
                .build();

        reviewRepository.save(review);

        // Update product average rating
        List<Review> reviews = reviewRepository.findByProductId(id);
        double sum = reviews.stream().mapToDouble(Review::getRating).sum();
        product.setAverageRating(Math.round((sum / reviews.size()) * 10.0) / 10.0);
        productRepository.save(product);

        return ResponseEntity.ok("Review added successfully!");
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
                .ownerRating(4.8) // Mock rating
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
