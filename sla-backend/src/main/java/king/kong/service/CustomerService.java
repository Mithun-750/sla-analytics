package king.kong.service;

import king.kong.dto.CustomerDto;
import king.kong.dto.PagedResponse;
import king.kong.model.Customer;
import king.kong.model.CustomerTier;
import king.kong.repository.CustomerRepository;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.Date;
import java.util.List;
import java.util.stream.Collectors;

@Service
public class CustomerService {

    private final CustomerRepository customerRepository;

    public CustomerService(CustomerRepository customerRepository) {
        this.customerRepository = customerRepository;
    }

    @Transactional(readOnly = true)
    public PagedResponse<CustomerDto> getCustomers(String search, Pageable pageable) {
        String s = (search != null && !search.isBlank()) ? search.trim() : "";
        Page<Customer> result = customerRepository.searchCustomers(s, pageable);
        List<CustomerDto> dtos = result.getContent().stream()
                .map(this::toDto).collect(Collectors.toList());
        return new PagedResponse<>(dtos, pageable.getPageNumber(), pageable.getPageSize(),
                result.getTotalElements(), result.getTotalPages());
    }

    @Transactional(readOnly = true)
    public CustomerDto getById(Integer id) {
        Customer c = customerRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Customer not found: " + id));
        return toDto(c);
    }

    @Transactional
    public CustomerDto createCustomer(String name, String email, String tier) {
        Customer customer = new Customer();
        customer.setName(name);
        customer.setEmail(email);
        customer.setTier(CustomerTier.valueOf(tier.toUpperCase()));
        customer.setCreatedAt(new Date());
        return toDto(customerRepository.save(customer));
    }

    private CustomerDto toDto(Customer c) {
        CustomerDto dto = new CustomerDto();
        dto.setId(c.getId());
        dto.setName(c.getName());
        dto.setEmail(c.getEmail());
        dto.setTier(c.getTier() != null ? c.getTier().name() : null);
        dto.setCreatedAt(c.getCreatedAt());
        return dto;
    }
}
