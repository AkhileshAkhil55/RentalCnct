package com.rentalconnect.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ReviewDTO {
    private Long id;
    private Long productId;
    private Long reviewerId;
    private String reviewerName;
    private String reviewerAvatar;
    private int rating;
    private String comment;
    private LocalDateTime createdAt;
}
