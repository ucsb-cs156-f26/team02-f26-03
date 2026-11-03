package edu.ucsb.cs156.example.integration;

import static org.junit.jupiter.api.Assertions.*;
import static org.springframework.security.test.web.servlet.request.SecurityMockMvcRequestPostProcessors.csrf;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

import edu.ucsb.cs156.example.entities.HelpRequest;
import edu.ucsb.cs156.example.repositories.HelpRequestRepository;
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

@SpringBootTest(webEnvironment = SpringBootTest.WebEnvironment.RANDOM_PORT)
@AutoConfigureMockMvc
@ActiveProfiles("integration")
@Import(TestConfig.class)
@DirtiesContext(classMode = DirtiesContext.ClassMode.BEFORE_EACH_TEST_METHOD)
public class HelpRequestIT {

  @Autowired HelpRequestRepository helpRequestRepository;

  @Autowired MockMvc mockMvc;

  @MockitoBean UserRepository userRepository;

  @WithMockUser(roles = {"ADMIN", "USER"})
  @Test
  public void admin_can_create_help_request() throws Exception {

    mockMvc
        .perform(
            post("/api/HelpRequest/post")
                .param("requesterEmail", "student@ucsb.edu")
                .param("teamId", "team_03")
                .param("tableOrBreakoutRoom", "table_07")
                .param("requestTime", "2026-11-02T18:00:00")
                .param("explanation", "Need help debugging")
                .param("solved", "false")
                .with(csrf()))
        .andExpect(status().isOk())
        .andExpect(jsonPath("$.requesterEmail").value("student@ucsb.edu"))
        .andExpect(jsonPath("$.teamId").value("team_03"));

    assertEquals(1, helpRequestRepository.count());

    HelpRequest saved = helpRequestRepository.findAll().iterator().next();

    assertEquals("student@ucsb.edu", saved.getRequesterEmail());
    assertEquals("team_03", saved.getTeamId());
    assertEquals("table_07", saved.getTableOrBreakoutRoom());
    assertEquals("Need help debugging", saved.getExplanation());
    assertFalse(saved.getSolved());
  }
}
