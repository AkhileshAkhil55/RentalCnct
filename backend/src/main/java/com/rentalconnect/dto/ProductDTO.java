package com.rentalconnect.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ProductDTO {
    private Long id;
    private String title;
    private String brand;
    private String model;
    private String description;
    private Long categoryId;
    private String categoryName;
    private Long ownerId;
    private String ownerName;
    private double ownerRating;
    private double pricePerDay;
    private double securityDeposit;
    private String pickupLocation;
    private boolean deliveryAvailable;
    private String itemCondition;
    private String specifications; // Serialized JSON or formatted string
    private double averageRating;
    private String status;
    private List<String> imageUrls;
}
