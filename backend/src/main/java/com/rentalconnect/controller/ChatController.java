package com.rentalconnect.controller;

import com.rentalconnect.dto.ChatDTO;
import com.rentalconnect.dto.MessageDTO;
import com.rentalconnect.entity.*;
import com.rentalconnect.repository.*;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.security.Principal;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/chats")
public class ChatController {

    @Autowired
    private ChatRepository chatRepository;

    @Autowired
    private MessageRepository messageRepository;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private ProductRepository productRepository;

    @Autowired
    private NotificationRepository notificationRepository;

    @GetMapping
    public ResponseEntity<List<ChatDTO>> getMyChats(Principal principal) {
        User user = userRepository.findByUsername(principal.getName()).orElseThrow();
        List<ChatDTO> chats = chatRepository.findByBuyerIdOrSellerIdOrderByCreatedAtDesc(user.getId(), user.getId()).stream()
                .map(chat -> mapToChatDTO(chat, user.getId()))
                .collect(Collectors.toList());
        return ResponseEntity.ok(chats);
    }

    @PostMapping
    public ResponseEntity<ChatDTO> startChat(@RequestParam Long productId, Principal principal) {
        User buyer = userRepository.findByUsername(principal.getName()).orElseThrow();
        Product product = productRepository.findById(productId)
                .orElseThrow(() -> new RuntimeException("Product not found"));
        User seller = product.getOwner();

        if (buyer.getId().equals(seller.getId())) {
            throw new RuntimeException("You cannot start a chat with yourself!");
        }

        Optional<Chat> existing = chatRepository.findByBuyerIdAndSellerIdAndProductId(buyer.getId(), seller.getId(), productId);
        if (existing.isPresent()) {
            return ResponseEntity.ok(mapToChatDTO(existing.get(), buyer.getId()));
        }

        Chat chat = Chat.builder()
                .buyer(buyer)
                .seller(seller)
                .product(product)
                .messages(new ArrayList<>())
                .build();
        chatRepository.save(chat);

        // Prepopulate with a greeting from the seller to start the conversation nicely!
        Message helloMsg = Message.builder()
                .chat(chat)
                .sender(seller)
                .messageText("Hi! Thanks for interest in my '" + product.getTitle() + "'. Let me know if you have any questions about this item!")
                .build();
        messageRepository.save(helloMsg);
        
        chat.getMessages().add(helloMsg);
        chatRepository.save(chat);

        return ResponseEntity.ok(mapToChatDTO(chat, buyer.getId()));
    }

    @GetMapping("/{chatId}/messages")
    public ResponseEntity<List<MessageDTO>> getChatMessages(@PathVariable Long chatId, Principal principal) {
        User user = userRepository.findByUsername(principal.getName()).orElseThrow();
        Chat chat = chatRepository.findById(chatId).orElseThrow();

        if (!chat.getBuyer().getId().equals(user.getId()) && !chat.getSeller().getId().equals(user.getId())) {
            return ResponseEntity.status(403).build();
        }

        List<MessageDTO> messages = messageRepository.findByChatIdOrderBySentAtAsc(chatId).stream()
                .map(msg -> MessageDTO.builder()
                        .id(msg.getId())
                        .senderId(msg.getSender().getId())
                        .senderName(msg.getSender().getFullName())
                        .messageText(msg.getMessageText())
                        .sentAt(msg.getSentAt())
                        .build())
                .collect(Collectors.toList());
        return ResponseEntity.ok(messages);
    }

    @PostMapping("/{chatId}/messages")
    public ResponseEntity<MessageDTO> sendMessage(
            @PathVariable Long chatId,
            @RequestBody MessageDTO dto,
            Principal principal
    ) {
        User sender = userRepository.findByUsername(principal.getName()).orElseThrow();
        Chat chat = chatRepository.findById(chatId).orElseThrow();

        if (!chat.getBuyer().getId().equals(sender.getId()) && !chat.getSeller().getId().equals(sender.getId())) {
            throw new RuntimeException("Unauthorized message sender");
        }

        Message message = Message.builder()
                .chat(chat)
                .sender(sender)
                .messageText(dto.getMessageText())
                .build();
        messageRepository.save(message);

        // Auto-reply Simulation
        // If the buyer sent this message, simulate an instant owner reply.
        if (chat.getBuyer().getId().equals(sender.getId())) {
            String autoReply = getSimulatedReply(dto.getMessageText(), chat.getProduct());
            
            Message reply = Message.builder()
                    .chat(chat)
                    .sender(chat.getSeller())
                    .messageText(autoReply)
                    .sentAt(LocalDateTime.now().plusSeconds(1)) // small virtual delay
                    .build();
            messageRepository.save(reply);

            // Notify buyer
            notificationRepository.save(Notification.builder()
                    .user(chat.getBuyer())
                    .title("Message from " + chat.getSeller().getFullName())
                    .message(autoReply)
                    .type("NEW_MESSAGE")
                    .build());
        } else {
            // If the seller replies, notify the buyer
            notificationRepository.save(Notification.builder()
                    .user(chat.getBuyer())
                    .title("Message from Owner")
                    .message(dto.getMessageText())
                    .type("NEW_MESSAGE")
                    .build());
        }

        return ResponseEntity.ok(MessageDTO.builder()
                .id(message.getId())
                .senderId(sender.getId())
                .senderName(sender.getFullName())
                .messageText(message.getMessageText())
                .sentAt(message.getSentAt())
                .build());
    }

    private String getSimulatedReply(String userMessage, Product product) {
        String msg = userMessage.toLowerCase();
        if (msg.contains("avail") || msg.contains("free") || msg.contains("date")) {
            return "Yes, it is fully available! You can select your booking dates in the calendar and check out. I will confirm it immediately.";
        }
        if (msg.contains("discount") || msg.contains("cheap") || msg.contains("price") || msg.contains("deposit")) {
            return "The price of $" + product.getPricePerDay() + "/day is fixed. The $" + product.getSecurityDeposit() + " security deposit is fully refunded back immediately once you return the item in good shape.";
        }
        if (msg.contains("pickup") || msg.contains("meet") || msg.contains("location") || msg.contains("deliver")) {
            String deliveryOption = product.isDeliveryAvailable() ? "I can also ship/deliver it to your address." : "It is pickup only.";
            return "We can arrange meetup/pickup at my location in " + product.getPickupLocation() + ". " + deliveryOption + " What works best for you?";
        }
        if (msg.contains("condition") || msg.contains("work") || msg.contains("damage")) {
            return "It's in " + product.getItemCondition().toLowerCase() + " condition, regularly serviced, and works flawlessly. You can test it fully upon pickup.";
        }
        return "That sounds good! Feel free to lock in your rental dates by placing a booking request, and I'll make sure it's packed and ready for you.";
    }

    private ChatDTO mapToChatDTO(Chat chat, Long currentUserId) {
        String firstUrl = "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=800";
        if (chat.getProduct().getImages() != null && !chat.getProduct().getImages().isEmpty()) {
            firstUrl = chat.getProduct().getImages().get(0).getImageUrl();
        }

        String lastMsgText = "Chat started";
        LocalDateTime lastSent = chat.getCreatedAt();
        if (chat.getMessages() != null && !chat.getMessages().isEmpty()) {
            Message last = chat.getMessages().get(chat.getMessages().size() - 1);
            lastMsgText = last.getMessageText();
            lastSent = last.getSentAt();
        }

        List<MessageDTO> msgs = chat.getMessages().stream()
                .map(m -> MessageDTO.builder()
                        .id(m.getId())
                        .senderId(m.getSender().getId())
                        .senderName(m.getSender().getFullName())
                        .messageText(m.getMessageText())
                        .sentAt(m.getSentAt())
                        .build())
                .collect(Collectors.toList());

        return ChatDTO.builder()
                .id(chat.getId())
                .buyerId(chat.getBuyer().getId())
                .buyerName(chat.getBuyer().getFullName())
                .sellerId(chat.getSeller().getId())
                .sellerName(chat.getSeller().getFullName())
                .productId(chat.getProduct().getId())
                .productTitle(chat.getProduct().getTitle())
                .firstImageUrl(firstUrl)
                .lastMessage(lastMsgText)
                .sentAt(lastSent)
                .messages(msgs)
                .build();
    }
}
