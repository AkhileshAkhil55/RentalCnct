package com.rentalconnect.controller;

import com.rentalconnect.dto.AddressDTO;
import com.rentalconnect.dto.UserProfileDTO;
import com.rentalconnect.entity.Address;
import com.rentalconnect.entity.User;
import com.rentalconnect.repository.AddressRepository;
import com.rentalconnect.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.security.Principal;
import java.util.List;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/users")
public class UserController {

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private AddressRepository addressRepository;

    @PutMapping("/profile")
    public ResponseEntity<?> updateProfile(@RequestBody UserProfileDTO profileDTO, Principal principal) {
        User user = userRepository.findByUsername(principal.getName()).orElseThrow();
        user.setFullName(profileDTO.getFullName());
        user.setPhone(profileDTO.getPhone());
        if (profileDTO.getAvatar() != null && !profileDTO.getAvatar().isBlank()) {
            user.setAvatar(profileDTO.getAvatar());
        }
        userRepository.save(user);

        return ResponseEntity.ok("Profile updated successfully!");
    }

    @GetMapping("/addresses")
    public ResponseEntity<List<AddressDTO>> getAddresses(Principal principal) {
        User user = userRepository.findByUsername(principal.getName()).orElseThrow();
        List<AddressDTO> addresses = addressRepository.findByUserId(user.getId()).stream()
                .map(addr -> AddressDTO.builder()
                        .id(addr.getId())
                        .street(addr.getStreet())
                        .city(addr.getCity())
                        .state(addr.getState())
                        .zipCode(addr.getZipCode())
                        .country(addr.getCountry())
                        .isDefault(addr.isDefault())
                        .build())
                .collect(Collectors.toList());
        return ResponseEntity.ok(addresses);
    }

    @PostMapping("/addresses")
    public ResponseEntity<?> saveAddress(@RequestBody AddressDTO addressDTO, Principal principal) {
        User user = userRepository.findByUsername(principal.getName()).orElseThrow();

        if (addressDTO.isDefault()) {
            // Reset other default addresses
            List<Address> addresses = addressRepository.findByUserId(user.getId());
            for (Address addr : addresses) {
                if (addr.isDefault()) {
                    addr.setDefault(false);
                    addressRepository.save(addr);
                }
            }
        }

        Address address = Address.builder()
                .user(user)
                .street(addressDTO.getStreet())
                .city(addressDTO.getCity())
                .state(addressDTO.getState())
                .zipCode(addressDTO.getZipCode())
                .country(addressDTO.getCountry())
                .isDefault(addressDTO.isDefault())
                .build();

        addressRepository.save(address);
        return ResponseEntity.ok("Address saved successfully!");
    }

    @DeleteMapping("/addresses/{id}")
    public ResponseEntity<?> deleteAddress(@PathVariable Long id, Principal principal) {
        User user = userRepository.findByUsername(principal.getName()).orElseThrow();
        Address address = addressRepository.findById(id).orElseThrow();

        if (!address.getUser().getId().equals(user.getId())) {
            return ResponseEntity.status(403).body("You are not authorized to delete this address.");
        }

        addressRepository.delete(address);
        return ResponseEntity.ok("Address deleted successfully!");
    }
}
