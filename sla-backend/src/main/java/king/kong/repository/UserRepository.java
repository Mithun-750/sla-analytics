package king.kong.repository;

import king.kong.model.User;
import king.kong.model.UserRole;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;

public interface UserRepository extends JpaRepository<User, Integer> {

    Page<User> findByRole(UserRole role, Pageable pageable);

    Page<User> findByRoleAndUsernameContainingIgnoreCase(UserRole role, String username, Pageable pageable);

    Page<User> findByUsernameContainingIgnoreCase(String username, Pageable pageable);
}

