package com.rentalconnect.controller;

import com.rentalconnect.dto.ProductDTO;
import com.rentalconnect.entity.Product;
import com.rentalconnect.entity.ProductImage;
import com.rentalconnect.entity.User;
import com.rentalconnect.entity.Wishlist;
import com.rentalconnect.repository.ProductRepository;
import com.rentalconnect.repository.UserRepository;
import com.rentalconnect.repository.WishlistRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.security.Principal;
import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/wishlist")
public class WishlistController {

    @Autowired
    private WishlistRepository wishlistRepository;

    @Autowired
    private ProductRepository productRepository;

    @Autowired
    private UserRepository userRepository;

    @GetMapping
    public ResponseEntity<List<ProductDTO>> getWishlist(Principal principal) {
        User user = userRepository.findByUsername(principal.getName()).orElseThrow();
        List<ProductDTO> products = wishlistRepository.findByUserId(user.getId()).stream()
                .map(wish -> mapToDTO(wish.getProduct()))
                .collect(Collectors.toList());
        return ResponseEntity.ok(products);
    }

    @PostMapping("/{productId}")
    public ResponseEntity<?> addToWishlist(@PathVariable Long productId, Principal principal) {
        User user = userRepository.findByUsername(principal.getName()).orElseThrow();
        Product product = productRepository.findById(productId)
                .orElseThrow(() -> new RuntimeException("Product not found"));

        Optional<Wishlist> existing = wishlistRepository.findByUserIdAndProductId(user.getId(), productId);
        if (existing.isPresent()) {
            return ResponseEntity.ok("Product is already in wishlist!");
        }

        Wishlist wishlist = Wishlist.builder()
                .user(user)
                .product(product)
                .build();
        wishlistRepository.save(wishlist);

        return ResponseEntity.ok("Added to wishlist!");
    }

    @DeleteMapping("/{productId}")
    public ResponseEntity<?> removeFromWishlist(@PathVariable Long productId, Principal principal) {
        User user = userRepository.findByUsername(principal.getName()).orElseThrow();
        Optional<Wishlist> existing = wishlistRepository.findByUserIdAndProductId(user.getId(), productId);
        
        if (existing.isPresent()) {
            wishlistRepository.delete(existing.get());
            return ResponseEntity.ok("Removed from wishlist!");
        }

        return ResponseEntity.badRequest().body("Product is not in wishlist!");
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
