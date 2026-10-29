package edu.ucsb.cs156.example.controllers;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.verifyNoInteractions;
import static org.mockito.Mockito.verifyNoMoreInteractions;
import static org.mockito.Mockito.when;
import static org.springframework.security.test.web.servlet.request.SecurityMockMvcRequestPostProcessors.csrf;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.delete;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.put;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import edu.ucsb.cs156.example.ControllerTestCase;
import edu.ucsb.cs156.example.entities.HelpRequest;
import edu.ucsb.cs156.example.repositories.HelpRequestRepository;
import edu.ucsb.cs156.example.repositories.UserRepository;
import edu.ucsb.cs156.example.testconfig.TestConfig;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;
import org.junit.jupiter.api.Test;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.context.annotation.Import;
import org.springframework.http.MediaType;
import org.springframework.security.test.context.support.WithMockUser;
import org.springframework.test.context.bean.override.mockito.MockitoBean;
import org.springframework.test.web.servlet.MvcResult;

@WebMvcTest(controllers = HelpRequestController.class)
@Import(TestConfig.class)
public class HelpRequestControllerTests extends ControllerTestCase {

  @MockitoBean HelpRequestRepository helpRequestRepository;

  @MockitoBean UserRepository userRepository;

  @Test
  public void logged_out_users_cannot_get_all() throws Exception {
    mockMvc.perform(get("/api/HelpRequest/all")).andExpect(status().isForbidden());

    verifyNoInteractions(helpRequestRepository);
  }

  @WithMockUser(roles = {"USER"})
  @Test
  public void logged_in_users_can_get_empty_list() throws Exception {
    when(helpRequestRepository.findAll()).thenReturn(List.of());

    MvcResult response =
        mockMvc.perform(get("/api/HelpRequest/all")).andExpect(status().isOk()).andReturn();

    verify(helpRequestRepository).findAll();
    assertEquals("[]", response.getResponse().getContentAsString());
  }

  @WithMockUser(roles = {"USER"})
  @Test
  public void logged_in_users_can_get_all_help_requests() throws Exception {
    HelpRequest first =
        HelpRequest.builder()
            .id(1L)
            .requesterEmail("first@ucsb.edu")
            .teamId("f26-03")
            .tableOrBreakoutRoom("7")
            .requestTime(LocalDateTime.parse("2026-10-20T11:30:00"))
            .explanation("Need help with Swagger")
            .solved(false)
            .build();

    HelpRequest second =
        HelpRequest.builder()
            .id(2L)
            .requesterEmail("second@ucsb.edu")
            .teamId("f26-04")
            .tableOrBreakoutRoom("Room 2")
            .requestTime(LocalDateTime.parse("2026-10-21T14:15:00"))
            .explanation("Need help with deployment")
            .solved(true)
            .build();

    List<HelpRequest> expectedRequests = List.of(first, second);
    when(helpRequestRepository.findAll()).thenReturn(expectedRequests);

    MvcResult response =
        mockMvc.perform(get("/api/HelpRequest/all")).andExpect(status().isOk()).andReturn();

    verify(helpRequestRepository).findAll();
    assertEquals(
        mapper.writeValueAsString(expectedRequests), response.getResponse().getContentAsString());
  }

  @Test
  public void logged_out_users_cannot_post() throws Exception {
    mockMvc
        .perform(
            post("/api/HelpRequest/post")
                .param("requesterEmail", "ckohlbrecher@ucsb.edu")
                .param("teamId", "f26-03")
                .param("tableOrBreakoutRoom", "7")
                .param("requestTime", "2026-10-20T11:30:00")
                .param("explanation", "Need help with Swagger")
                .param("solved", "false")
                .with(csrf()))
        .andExpect(status().isForbidden());

    verifyNoInteractions(helpRequestRepository);
  }

  @WithMockUser(roles = {"USER"})
  @Test
  public void regular_users_cannot_post() throws Exception {
    mockMvc
        .perform(
            post("/api/HelpRequest/post")
                .param("requesterEmail", "ckohlbrecher@ucsb.edu")
                .param("teamId", "f26-03")
                .param("tableOrBreakoutRoom", "7")
                .param("requestTime", "2026-10-20T11:30:00")
                .param("explanation", "Need help with Swagger")
                .param("solved", "false")
                .with(csrf()))
        .andExpect(status().isForbidden());

    verifyNoInteractions(helpRequestRepository);
  }

  @WithMockUser(roles = {"ADMIN", "USER"})
  @Test
  public void admin_can_post_unsolved_help_request() throws Exception {
    checkAdminPost(false);
  }

  @WithMockUser(roles = {"ADMIN", "USER"})
  @Test
  public void admin_can_post_solved_help_request() throws Exception {
    checkAdminPost(true);
  }

  private void checkAdminPost(boolean solved) throws Exception {
    LocalDateTime requestTime = LocalDateTime.parse("2026-10-20T11:30:00");

    HelpRequest incoming =
        HelpRequest.builder()
            .requesterEmail("ckohlbrecher@ucsb.edu")
            .teamId("f26-03")
            .tableOrBreakoutRoom("7")
            .requestTime(requestTime)
            .explanation("Need help with Swagger")
            .solved(solved)
            .build();

    HelpRequest saved =
        HelpRequest.builder()
            .id(42L)
            .requesterEmail("ckohlbrecher@ucsb.edu")
            .teamId("f26-03")
            .tableOrBreakoutRoom("7")
            .requestTime(requestTime)
            .explanation("Need help with Swagger")
            .solved(solved)
            .build();

    when(helpRequestRepository.save(eq(incoming))).thenReturn(saved);

    MvcResult response =
        mockMvc
            .perform(
                post("/api/HelpRequest/post")
                    .param("requesterEmail", "ckohlbrecher@ucsb.edu")
                    .param("teamId", "f26-03")
                    .param("tableOrBreakoutRoom", "7")
                    .param("requestTime", "2026-10-20T11:30:00")
                    .param("explanation", "Need help with Swagger")
                    .param("solved", Boolean.toString(solved))
                    .with(csrf()))
            .andExpect(status().isOk())
            .andReturn();

    verify(helpRequestRepository).save(eq(incoming));
    assertEquals(mapper.writeValueAsString(saved), response.getResponse().getContentAsString());
  }

  @Test
  public void logged_out_users_cannot_get_by_id() throws Exception {
    mockMvc.perform(get("/api/HelpRequest").param("id", "7")).andExpect(status().isForbidden());

    verifyNoInteractions(helpRequestRepository);
  }

  @WithMockUser(roles = {"USER"})
  @Test
  public void logged_in_users_can_get_existing_help_request() throws Exception {
    HelpRequest expected =
        HelpRequest.builder()
            .id(7L)
            .requesterEmail("ckohlbrecher@ucsb.edu")
            .teamId("f26-03")
            .tableOrBreakoutRoom("Table 7")
            .requestTime(LocalDateTime.parse("2026-10-20T11:30:00"))
            .explanation("Need help with Swagger")
            .solved(true)
            .build();

    when(helpRequestRepository.findById(eq(7L))).thenReturn(Optional.of(expected));

    MvcResult response =
        mockMvc
            .perform(get("/api/HelpRequest").param("id", "7"))
            .andExpect(status().isOk())
            .andReturn();

    verify(helpRequestRepository).findById(eq(7L));
    assertEquals(mapper.writeValueAsString(expected), response.getResponse().getContentAsString());
  }

  @WithMockUser(roles = {"USER"})
  @Test
  public void missing_help_request_returns_not_found() throws Exception {
    when(helpRequestRepository.findById(eq(123L))).thenReturn(Optional.empty());

    MvcResult response =
        mockMvc
            .perform(get("/api/HelpRequest").param("id", "123"))
            .andExpect(status().isNotFound())
            .andReturn();

    verify(helpRequestRepository).findById(eq(123L));

    var json = responseToJson(response);
    assertEquals("EntityNotFoundException", json.get("type"));
    assertEquals("HelpRequest with id 123 not found", json.get("message"));
  }

  @Test
  public void logged_out_users_cannot_put() throws Exception {
    mockMvc
        .perform(
            put("/api/HelpRequest")
                .param("id", "7")
                .contentType(MediaType.APPLICATION_JSON)
                .content("{}")
                .with(csrf()))
        .andExpect(status().isForbidden());

    verifyNoInteractions(helpRequestRepository);
  }

  @WithMockUser(roles = {"USER"})
  @Test
  public void regular_users_cannot_put() throws Exception {
    mockMvc
        .perform(
            put("/api/HelpRequest")
                .param("id", "7")
                .contentType(MediaType.APPLICATION_JSON)
                .content("{}")
                .with(csrf()))
        .andExpect(status().isForbidden());

    verifyNoInteractions(helpRequestRepository);
  }

  @WithMockUser(roles = {"ADMIN", "USER"})
  @Test
  public void admin_can_update_help_request_to_solved() throws Exception {
    checkAdminPut(true);
  }

  @WithMockUser(roles = {"ADMIN", "USER"})
  @Test
  public void admin_can_update_help_request_to_unsolved() throws Exception {
    checkAdminPut(false);
  }

  private void checkAdminPut(boolean solved) throws Exception {
    HelpRequest original =
        HelpRequest.builder()
            .id(7L)
            .requesterEmail("original@ucsb.edu")
            .teamId("f26-01")
            .tableOrBreakoutRoom("Table 1")
            .requestTime(LocalDateTime.parse("2026-10-19T10:00:00"))
            .explanation("Original explanation")
            .solved(!solved)
            .build();

    HelpRequest incoming =
        HelpRequest.builder()
            .id(999L)
            .requesterEmail("updated@ucsb.edu")
            .teamId("f26-03")
            .tableOrBreakoutRoom("Table 7")
            .requestTime(LocalDateTime.parse("2026-10-20T11:30:00"))
            .explanation("Updated explanation")
            .solved(solved)
            .build();

    HelpRequest expected =
        HelpRequest.builder()
            .id(7L)
            .requesterEmail("updated@ucsb.edu")
            .teamId("f26-03")
            .tableOrBreakoutRoom("Table 7")
            .requestTime(LocalDateTime.parse("2026-10-20T11:30:00"))
            .explanation("Updated explanation")
            .solved(solved)
            .build();

    when(helpRequestRepository.findById(eq(7L))).thenReturn(Optional.of(original));
    when(helpRequestRepository.save(eq(expected))).thenReturn(expected);

    MvcResult response =
        mockMvc
            .perform(
                put("/api/HelpRequest")
                    .param("id", "7")
                    .contentType(MediaType.APPLICATION_JSON)
                    .content(mapper.writeValueAsString(incoming))
                    .with(csrf()))
            .andExpect(status().isOk())
            .andReturn();

    verify(helpRequestRepository).findById(eq(7L));
    verify(helpRequestRepository).save(eq(expected));
    assertEquals(expected, original);
    assertEquals(mapper.writeValueAsString(expected), response.getResponse().getContentAsString());
  }

  @WithMockUser(roles = {"ADMIN", "USER"})
  @Test
  public void admin_put_missing_help_request_returns_not_found() throws Exception {
    when(helpRequestRepository.findById(eq(123L))).thenReturn(Optional.empty());

    MvcResult response =
        mockMvc
            .perform(
                put("/api/HelpRequest")
                    .param("id", "123")
                    .contentType(MediaType.APPLICATION_JSON)
                    .content("{}")
                    .with(csrf()))
            .andExpect(status().isNotFound())
            .andReturn();

    verify(helpRequestRepository).findById(eq(123L));
    verify(helpRequestRepository, never()).save(any(HelpRequest.class));

    var json = responseToJson(response);
    assertEquals("EntityNotFoundException", json.get("type"));
    assertEquals("HelpRequest with id 123 not found", json.get("message"));
  }

  @Test
  public void logged_out_users_cannot_delete() throws Exception {
    mockMvc
        .perform(delete("/api/HelpRequest").param("id", "7").with(csrf()))
        .andExpect(status().isForbidden());

    verifyNoInteractions(helpRequestRepository);
  }

  @WithMockUser(roles = {"USER"})
  @Test
  public void regular_users_cannot_delete() throws Exception {
    mockMvc
        .perform(delete("/api/HelpRequest").param("id", "7").with(csrf()))
        .andExpect(status().isForbidden());

    verifyNoInteractions(helpRequestRepository);
  }

  @WithMockUser(roles = {"ADMIN", "USER"})
  @Test
  public void admin_can_delete_existing_help_request() throws Exception {
    HelpRequest helpRequest =
        HelpRequest.builder()
            .id(7L)
            .requesterEmail("ckohlbrecher@ucsb.edu")
            .teamId("f26-03")
            .tableOrBreakoutRoom("Table 7")
            .requestTime(LocalDateTime.parse("2026-10-20T11:30:00"))
            .explanation("Need help with Swagger")
            .solved(false)
            .build();

    when(helpRequestRepository.findById(eq(7L))).thenReturn(Optional.of(helpRequest));

    MvcResult response =
        mockMvc
            .perform(delete("/api/HelpRequest").param("id", "7").with(csrf()))
            .andExpect(status().isOk())
            .andReturn();

    verify(helpRequestRepository).findById(eq(7L));
    verify(helpRequestRepository).delete(eq(helpRequest));
    verifyNoMoreInteractions(helpRequestRepository);

    var json = responseToJson(response);
    assertEquals("HelpRequest with id 7 deleted", json.get("message"));
  }

  @WithMockUser(roles = {"ADMIN", "USER"})
  @Test
  public void admin_delete_missing_help_request_returns_not_found() throws Exception {
    when(helpRequestRepository.findById(eq(123L))).thenReturn(Optional.empty());

    MvcResult response =
        mockMvc
            .perform(delete("/api/HelpRequest").param("id", "123").with(csrf()))
            .andExpect(status().isNotFound())
            .andReturn();

    verify(helpRequestRepository).findById(eq(123L));
    verifyNoMoreInteractions(helpRequestRepository);

    var json = responseToJson(response);
    assertEquals("EntityNotFoundException", json.get("type"));
    assertEquals("HelpRequest with id 123 not found", json.get("message"));
  }
}
