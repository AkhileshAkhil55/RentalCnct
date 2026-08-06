package com.rentalconnect.controller;

import com.rentalconnect.dto.NotificationDTO;
import com.rentalconnect.entity.Notification;
import com.rentalconnect.entity.User;
import com.rentalconnect.repository.NotificationRepository;
import com.rentalconnect.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.security.Principal;
import java.util.List;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/notifications")
public class NotificationController {

    @Autowired
    private NotificationRepository notificationRepository;

    @Autowired
    private UserRepository userRepository;

    @GetMapping
    public ResponseEntity<List<NotificationDTO>> getNotifications(Principal principal) {
        User user = userRepository.findByUsername(principal.getName()).orElseThrow();
        List<NotificationDTO> notifications = notificationRepository.findByUserIdOrderByCreatedAtDesc(user.getId()).stream()
                .map(notif -> NotificationDTO.builder()
                        .id(notif.getId())
                        .title(notif.getTitle())
                        .message(notif.getMessage())
                        .type(notif.getType())
                        .isRead(notif.isRead())
                        .createdAt(notif.getCreatedAt())
                        .build())
                .collect(Collectors.toList());
        return ResponseEntity.ok(notifications);
    }

    @GetMapping("/unread-count")
    public ResponseEntity<Long> getUnreadCount(Principal principal) {
        User user = userRepository.findByUsername(principal.getName()).orElseThrow();
        long count = notificationRepository.countByUserIdAndIsReadFalse(user.getId());
        return ResponseEntity.ok(count);
    }

    @PutMapping("/{id}/read")
    public ResponseEntity<?> markAsRead(@PathVariable Long id, Principal principal) {
        User user = userRepository.findByUsername(principal.getName()).orElseThrow();
        Notification notif = notificationRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Notification not find"));

        if (!notif.getUser().getId().equals(user.getId())) {
            return ResponseEntity.status(403).body("Unauthorized");
        }

        notif.setRead(true);
        notificationRepository.save(notif);
        return ResponseEntity.ok("Notification marked as read");
    }

    @PutMapping("/read-all")
    public ResponseEntity<?> readAllNotifications(Principal principal) {
        User user = userRepository.findByUsername(principal.getName()).orElseThrow();
        List<Notification> unread = notificationRepository.findByUserIdOrderByCreatedAtDesc(user.getId());
        for (Notification notif : unread) {
            if (!notif.isRead()) {
                notif.setRead(true);
                notificationRepository.save(notif);
            }
        }
        return ResponseEntity.ok("All notifications marked as read");
    }
}
