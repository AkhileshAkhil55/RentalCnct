package com.rentalconnect.entity;

import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "products")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Product {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String title;

    private String brand;
    
    private String model;

    @Column(columnDefinition = "TEXT")
    private String description;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "category_id", nullable = false)
    private Category category;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "owner_id", nullable = false)
    private User owner;

    @Column(name = "price_per_day", nullable = false)
    private double pricePerDay;

    @Column(name = "security_deposit", nullable = false)
    private double securityDeposit;

    @Column(name = "pickup_location", nullable = false)
    private String pickupLocation;

    @Column(name = "delivery_available", nullable = false)
    private boolean deliveryAvailable;

    @Column(name = "item_condition", nullable = false)
    private String itemCondition;

    @Column(columnDefinition = "TEXT")
    private String specifications; // Serialized JSON string (e.g., {"Brand":"Sony", "Color":"Black"})

    @Column(name = "average_rating")
    private double averageRating;

    @Column(nullable = false)
    private String status; // PENDING_APPROVAL, APPROVED, REJECTED, SUSPENDED

    @OneToMany(mappedBy = "product", cascade = CascadeType.ALL, orphanRemoval = true, fetch = FetchType.EAGER)
    @Builder.Default
    private List<ProductImage> images = new ArrayList<>();

    @Column(name = "created_at", nullable = false)
    private LocalDateTime createdAt;

    @PrePersist
    protected void onCreate() {
        createdAt = LocalDateTime.now();
        if (status == null) {
            status = "PENDING_APPROVAL"; // By default, listing needs admin approval
        }
    }

    public void addImage(ProductImage image) {
        images.add(image);
        image.setProduct(this);
    }
}
