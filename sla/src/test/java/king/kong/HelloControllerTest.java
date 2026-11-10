package king.kong;

import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.BeforeEach;
import org.springframework.jdbc.core.RowMapper;
import org.springframework.jdbc.core.namedparam.SqlParameterSource;
import org.springframework.jdbc.core.namedparam.NamedParameterJdbcTemplate;
import org.springframework.test.util.ReflectionTestUtils;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.setup.MockMvcBuilders;

import static org.junit.jupiter.api.Assertions.assertTrue;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.content;

public class HelloControllerTest {

    MockMvc mockMvc;
    NamedParameterJdbcTemplate jdbcTemplate;

    @BeforeEach
    void setUp() {
        jdbcTemplate = mock(NamedParameterJdbcTemplate.class);
        HelloController controller = new HelloController();
        ReflectionTestUtils.setField(controller, "jdbcTemplate", jdbcTemplate);
        mockMvc = MockMvcBuilders.standaloneSetup(controller).build();
    }

    @Test
    public void testHello() throws Exception {
        mockMvc.perform(get("/"))
                .andExpect(content().string("Hello World!"));
    }

    @Test
    public void testCalc() throws Exception {
        when(jdbcTemplate.queryForObject(
                org.mockito.ArgumentMatchers.anyString(),
                org.mockito.ArgumentMatchers.any(SqlParameterSource.class),
                org.mockito.ArgumentMatchers.<RowMapper<HelloController.Result>>any()))
                .thenReturn(new HelloController.Result(100, 200, 300));
        String response = mockMvc.perform(get("/calc?left=100&right=200"))
                .andReturn().getResponse().getContentAsString();
        assertTrue(response.contains("\"left\":100"));
        assertTrue(response.contains("\"right\":200"));
        assertTrue(response.contains("\"answer\":300"));
    }
}