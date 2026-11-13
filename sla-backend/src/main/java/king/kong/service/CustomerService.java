package king.kong.service;

import king.kong.dto.CustomerDto;
import king.kong.dto.PagedResponse;
import king.kong.model.Customer;
import king.kong.model.CustomerTier;
import king.kong.repository.CustomerRepository;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
public class CustomerService {

    private final CustomerRepository customerRepository;

    public CustomerService(CustomerRepository customerRepository) {
        this.customerRepository = customerRepository;
    }

    @Transactional(readOnly = true)
    public PagedResponse<CustomerDto> getCustomers(String search, int page, int size) {
        PageRequest pr = PageRequest.of(page, size);
        Page<Customer> result;
        if (search != null && !search.isBlank()) {
            result = customerRepository.findByNameContainingIgnoreCase(search, pr);
        } else {
            result = customerRepository.findAll(pr);
        }
        List<CustomerDto> dtos = result.getContent().stream()
                .map(this::toDto).collect(Collectors.toList());
        return new PagedResponse<>(dtos, page, size, result.getTotalElements(), result.getTotalPages());
    }

    @Transactional(readOnly = true)
    public CustomerDto getById(Integer id) {
        Customer customer = customerRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Customer not found: " + id));
        return toDto(customer);
    }

    @Transactional
    public CustomerDto createCustomer(String name, String email, String tier) {
        Customer customer = new Customer();
        customer.setName(name);
        customer.setEmail(email);
        customer.setTier(CustomerTier.valueOf(tier.toUpperCase()));
        return toDto(customerRepository.save(customer));
    }

    private CustomerDto toDto(Customer customer) {
        CustomerDto dto = new CustomerDto();
        dto.setId(customer.getId());
        dto.setName(customer.getName());
        dto.setEmail(customer.getEmail());
        dto.setTier(customer.getTier() != null ? customer.getTier().name() : null);
        dto.setCreatedAt(customer.getCreatedAt());
        return dto;
    }
}

