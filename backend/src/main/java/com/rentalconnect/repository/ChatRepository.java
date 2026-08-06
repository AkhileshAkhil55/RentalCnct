package com.rentalconnect.repository;

import com.rentalconnect.entity.Chat;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;
import java.util.Optional;

@Repository
public interface ChatRepository extends JpaRepository<Chat, Long> {
    List<Chat> findByBuyerIdOrSellerIdOrderByCreatedAtDesc(Long buyerId, Long sellerId);
    Optional<Chat> findByBuyerIdAndSellerIdAndProductId(Long buyerId, Long sellerId, Long productId);
}
