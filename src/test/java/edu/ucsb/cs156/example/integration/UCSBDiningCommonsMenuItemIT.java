package edu.ucsb.cs156.example.integration;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.springframework.security.test.web.servlet.request.SecurityMockMvcRequestPostProcessors.csrf;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

import com.fasterxml.jackson.databind.ObjectMapper;
import edu.ucsb.cs156.example.entities.UCSBDiningCommonsMenuItem;
import edu.ucsb.cs156.example.repositories.UCSBDiningCommonsMenuItemRepository;
import edu.ucsb.cs156.example.repositories.UserRepository;
import edu.ucsb.cs156.example.testconfig.TestConfig;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.context.annotation.Import;
import org.springframework.security.test.context.support.WithMockUser;
import org.springframework.test.annotation.DirtiesContext;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.context.bean.override.mockito.MockitoBean;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.MvcResult;

@SpringBootTest(webEnvironment = SpringBootTest.WebEnvironment.RANDOM_PORT)
@AutoConfigureMockMvc
@ActiveProfiles("integration")
@Import(TestConfig.class)
@DirtiesContext(classMode = DirtiesContext.ClassMode.BEFORE_EACH_TEST_METHOD)
public class UCSBDiningCommonsMenuItemIT {

  @Autowired private MockMvc mockMvc;

  @Autowired private ObjectMapper mapper;

  @Autowired private UCSBDiningCommonsMenuItemRepository repository;

  @MockitoBean private UserRepository userRepository;

  @Test
  @WithMockUser(roles = {"ADMIN", "USER"})
  public void adminCanCreateMenuItemInDatabase() throws Exception {

    // Arrange
    long countBefore = repository.count();

    // Act
    MvcResult response =
        mockMvc
            .perform(
                post("/api/UCSBDiningCommonsMenuItem/post")
                    .param("diningCommonsCode", "dlg")
                    .param("name", "Grilled Chicken")
                    .param("station", "Grill")
                    .with(csrf()))
            .andExpect(status().isOk())
            .andReturn();

    // Assert: check the actual database
    String responseJson = response.getResponse().getContentAsString();

    UCSBDiningCommonsMenuItem created =
        mapper.readValue(responseJson, UCSBDiningCommonsMenuItem.class);

    UCSBDiningCommonsMenuItem saved = repository.findById(created.getId()).orElseThrow();

    assertEquals(countBefore + 1, repository.count());
    assertEquals("dlg", saved.getDiningCommonsCode());
    assertEquals("Grilled Chicken", saved.getName());
    assertEquals("Grill", saved.getStation());
  }
}
