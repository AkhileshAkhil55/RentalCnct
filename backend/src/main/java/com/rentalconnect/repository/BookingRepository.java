package com.rentalconnect.repository;

import com.rentalconnect.entity.Booking;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface BookingRepository extends JpaRepository<Booking, Long> {
    List<Booking> findByRenterId(Long renterId);
    List<Booking> findByProductOwnerId(Long ownerId);
    List<Booking> findByProductId(Long productId);
}
