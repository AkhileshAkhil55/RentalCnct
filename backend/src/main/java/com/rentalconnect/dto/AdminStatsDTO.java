package com.rentalconnect.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.util.Map;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class AdminStatsDTO {
    private long totalUsers;
    private long totalProducts;
    private long totalBookings;
    private double totalRevenue;
    private long pendingListingsCount;
    private long activeRentalsCount;
    private Map<String, Long> categoryDistribution;
    private Map<String, Double> monthlyEarnings;
}
