package com.rentalconnect.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.time.LocalDate;
import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class BookingDTO {
    private Long id;
    private Long productId;
    private String productTitle;
    private String productBrand;
    private String productModel;
    private double productPrice;
    private double securityDeposit;
    private String firstImageUrl;
    private Long renterId;
    private String renterName;
    private LocalDate startDate;
    private LocalDate endDate;
    private double totalPrice;
    private String status;
    private String paymentMethod;
    private String paymentStatus;
    private LocalDateTime createdAt;
}
