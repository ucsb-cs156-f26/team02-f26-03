package edu.ucsb.cs156.example.controllers;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.times;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;
import static org.springframework.security.test.web.servlet.request.SecurityMockMvcRequestPostProcessors.csrf;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.delete;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.put;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import edu.ucsb.cs156.example.ControllerTestCase;
import edu.ucsb.cs156.example.entities.UCSBDiningCommonsMenuItem;
import edu.ucsb.cs156.example.repositories.UCSBDiningCommonsMenuItemRepository;
import edu.ucsb.cs156.example.repositories.UserRepository;
import edu.ucsb.cs156.example.testconfig.TestConfig;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import org.junit.jupiter.api.Test;
import org.mockito.ArgumentCaptor;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.context.annotation.Import;
import org.springframework.http.MediaType;
import org.springframework.security.test.context.support.WithMockUser;
import org.springframework.test.context.bean.override.mockito.MockitoBean;
import org.springframework.test.web.servlet.MvcResult;

@WebMvcTest(controllers = UCSBDiningCommonsMenuItemController.class)
@Import(TestConfig.class)
public class UCSBDiningCommonsMenuItemControllerTests extends ControllerTestCase {
  @MockitoBean UCSBDiningCommonsMenuItemRepository ucsbDiningCommonsMenuItemRepository;

  @MockitoBean UserRepository userRepository;

  @Test
  public void logged_out_users_cannot_get_all() throws Exception {
    mockMvc.perform(get("/api/UCSBDiningCommonsMenuItem/all")).andExpect(status().isForbidden());
  }

  @WithMockUser(roles = {"USER"})
  @Test
  public void logged_in_users_can_get_all() throws Exception {

    // Arrange
    UCSBDiningCommonsMenuItem pizza =
        UCSBDiningCommonsMenuItem.builder()
            .id(1L)
            .diningCommonsCode("ortega")
            .name("Pizza")
            .station("Entrees")
            .build();

    List<UCSBDiningCommonsMenuItem> expectedItems = List.of(pizza);

    when(ucsbDiningCommonsMenuItemRepository.findAll()).thenReturn(expectedItems);

    // Act
    MvcResult response =
        mockMvc
            .perform(get("/api/UCSBDiningCommonsMenuItem/all"))
            .andExpect(status().isOk())
            .andReturn();

    // Assert
    verify(ucsbDiningCommonsMenuItemRepository, times(1)).findAll();

    String expectedJson = mapper.writeValueAsString(expectedItems);
    String actualJson = response.getResponse().getContentAsString();

    assertEquals(expectedJson, actualJson);
  }

  @Test
  public void logged_out_users_cannot_post() throws Exception {
    mockMvc
        .perform(
            post("/api/UCSBDiningCommonsMenuItem/post")
                .param("diningCommonsCode", "ortega")
                .param("name", "Pizza")
                .param("station", "Entrees")
                .with(csrf()))
        .andExpect(status().isForbidden());
  }

  @WithMockUser(roles = {"USER"})
  @Test
  public void regular_users_cannot_post() throws Exception {
    mockMvc
        .perform(
            post("/api/UCSBDiningCommonsMenuItem/post")
                .param("diningCommonsCode", "ortega")
                .param("name", "Pizza")
                .param("station", "Entrees")
                .with(csrf()))
        .andExpect(status().isForbidden());
  }

  @WithMockUser(roles = {"ADMIN"})
  @Test
  public void admin_users_can_post() throws Exception {
    UCSBDiningCommonsMenuItem savedItem =
        UCSBDiningCommonsMenuItem.builder()
            .id(1L)
            .diningCommonsCode("ortega")
            .name("Pizza")
            .station("Entrees")
            .build();

    when(ucsbDiningCommonsMenuItemRepository.save(any(UCSBDiningCommonsMenuItem.class)))
        .thenReturn(savedItem);

    MvcResult response =
        mockMvc
            .perform(
                post("/api/UCSBDiningCommonsMenuItem/post")
                    .param("diningCommonsCode", "ortega")
                    .param("name", "Pizza")
                    .param("station", "Entrees")
                    .with(csrf()))
            .andExpect(status().isOk())
            .andReturn();

    // Assert

    // Assert
    ArgumentCaptor<UCSBDiningCommonsMenuItem> captor =
        ArgumentCaptor.forClass(UCSBDiningCommonsMenuItem.class);

    verify(ucsbDiningCommonsMenuItemRepository, times(1)).save(captor.capture());

    UCSBDiningCommonsMenuItem actualSavedItem = captor.getValue();

    assertEquals("ortega", actualSavedItem.getDiningCommonsCode());
    assertEquals("Pizza", actualSavedItem.getName());
    assertEquals("Entrees", actualSavedItem.getStation());

    String expectedJson = mapper.writeValueAsString(savedItem);
    String actualJson = response.getResponse().getContentAsString();

    assertEquals(expectedJson, actualJson);
  }

  @Test
  public void logged_out_users_cannot_get_by_id() throws Exception {
    mockMvc
        .perform(get("/api/UCSBDiningCommonsMenuItem").param("id", "7"))
        .andExpect(status().isForbidden());
  }

  @WithMockUser(roles = {"USER"})
  @Test
  public void logged_in_user_can_get_by_id_when_id_exists() throws Exception {

    // Arrange
    UCSBDiningCommonsMenuItem pizza =
        UCSBDiningCommonsMenuItem.builder()
            .id(7L)
            .diningCommonsCode("ortega")
            .name("Pizza")
            .station("Entrees")
            .build();

    when(ucsbDiningCommonsMenuItemRepository.findById(7L)).thenReturn(Optional.of(pizza));

    // Act
    MvcResult response =
        mockMvc
            .perform(get("/api/UCSBDiningCommonsMenuItem").param("id", "7"))
            .andExpect(status().isOk())
            .andReturn();

    // Assert
    verify(ucsbDiningCommonsMenuItemRepository, times(1)).findById(7L);

    String expectedJson = mapper.writeValueAsString(pizza);
    String actualJson = response.getResponse().getContentAsString();

    assertEquals(expectedJson, actualJson);
  }

  @WithMockUser(roles = {"USER"})
  @Test
  public void logged_in_user_cannot_get_by_id_when_id_missing() throws Exception {

    // Arrange
    when(ucsbDiningCommonsMenuItemRepository.findById(7L)).thenReturn(Optional.empty());

    // Act
    MvcResult response =
        mockMvc
            .perform(get("/api/UCSBDiningCommonsMenuItem").param("id", "7"))
            .andExpect(status().isNotFound())
            .andReturn();

    // Assert
    verify(ucsbDiningCommonsMenuItemRepository, times(1)).findById(7L);

    Map<String, Object> json = responseToJson(response);

    assertEquals("EntityNotFoundException", json.get("type"));
    assertEquals("UCSBDiningCommonsMenuItem with id 7 not found", json.get("message"));
  }

  @WithMockUser(roles = {"ADMIN"})
  @Test
  public void admin_users_can_put_existing_item() throws Exception {

    // Arrange: Existing database record
    UCSBDiningCommonsMenuItem existing =
        UCSBDiningCommonsMenuItem.builder()
            .id(1L)
            .diningCommonsCode("ortega")
            .name("Pizza")
            .station("Entrees")
            .build();

    // New values submitted by the client
    UCSBDiningCommonsMenuItem incoming =
        UCSBDiningCommonsMenuItem.builder()
            .id(999L)
            .diningCommonsCode("carrillo")
            .name("Pasta")
            .station("Pasta Station")
            .build();

    when(ucsbDiningCommonsMenuItemRepository.findById(1L)).thenReturn(Optional.of(existing));

    // Act
    MvcResult response =
        mockMvc
            .perform(
                put("/api/UCSBDiningCommonsMenuItem")
                    .param("id", "1")
                    .contentType(MediaType.APPLICATION_JSON)
                    .content(mapper.writeValueAsString(incoming))
                    .with(csrf()))
            .andExpect(status().isOk())
            .andReturn();

    // Assert
    ArgumentCaptor<UCSBDiningCommonsMenuItem> captor =
        ArgumentCaptor.forClass(UCSBDiningCommonsMenuItem.class);

    verify(ucsbDiningCommonsMenuItemRepository, times(1)).save(captor.capture());

    UCSBDiningCommonsMenuItem savedItem = captor.getValue();

    assertEquals(1L, savedItem.getId());
    assertEquals("carrillo", savedItem.getDiningCommonsCode());
    assertEquals("Pasta", savedItem.getName());
    assertEquals("Pasta Station", savedItem.getStation());

    String expectedJson = mapper.writeValueAsString(savedItem);
    String actualJson = response.getResponse().getContentAsString();

    assertEquals(expectedJson, actualJson);
  }

  @WithMockUser(roles = {"ADMIN"})
  @Test
  public void admin_cannot_put_nonexistent_item() throws Exception {

    // Arrange
    UCSBDiningCommonsMenuItem incoming =
        UCSBDiningCommonsMenuItem.builder()
            .id(99999L)
            .diningCommonsCode("carrillo")
            .name("Pasta")
            .station("Pasta Station")
            .build();

    when(ucsbDiningCommonsMenuItemRepository.findById(99999L)).thenReturn(Optional.empty());

    // Act
    MvcResult response =
        mockMvc
            .perform(
                put("/api/UCSBDiningCommonsMenuItem")
                    .param("id", "99999")
                    .contentType(MediaType.APPLICATION_JSON)
                    .content(mapper.writeValueAsString(incoming))
                    .with(csrf()))
            .andExpect(status().isNotFound())
            .andReturn();

    // Assert
    verify(ucsbDiningCommonsMenuItemRepository, times(1)).findById(99999L);

    verify(ucsbDiningCommonsMenuItemRepository, times(0))
        .save(any(UCSBDiningCommonsMenuItem.class));

    Map<String, Object> json = responseToJson(response);

    assertEquals("EntityNotFoundException", json.get("type"));
    assertEquals("UCSBDiningCommonsMenuItem with id 99999 not found", json.get("message"));
  }

  @WithMockUser(roles = {"ADMIN"})
  @Test
  public void admin_can_delete_existing_menu_item() throws Exception {

    // Arrange
    UCSBDiningCommonsMenuItem item =
        UCSBDiningCommonsMenuItem.builder()
            .id(1L)
            .diningCommonsCode("ortega")
            .name("DeleteTest")
            .station("Test Station")
            .build();

    when(ucsbDiningCommonsMenuItemRepository.findById(1L)).thenReturn(Optional.of(item));

    // Act
    MvcResult response =
        mockMvc
            .perform(delete("/api/UCSBDiningCommonsMenuItem").param("id", "1").with(csrf()))
            .andExpect(status().isOk())
            .andReturn();

    // Assert
    verify(ucsbDiningCommonsMenuItemRepository, times(1)).findById(1L);

    verify(ucsbDiningCommonsMenuItemRepository, times(1)).delete(item);

    Map<String, Object> json = responseToJson(response);

    assertEquals("UCSBDiningCommonsMenuItem with id 1 deleted", json.get("message"));
  }

  @WithMockUser(roles = {"ADMIN"})
  @Test
  public void admin_cannot_delete_nonexistent_menu_item() throws Exception {

    // Arrange
    when(ucsbDiningCommonsMenuItemRepository.findById(99999L)).thenReturn(Optional.empty());

    // Act
    MvcResult response =
        mockMvc
            .perform(delete("/api/UCSBDiningCommonsMenuItem").param("id", "99999").with(csrf()))
            .andExpect(status().isNotFound())
            .andReturn();

    // Assert
    verify(ucsbDiningCommonsMenuItemRepository, times(1)).findById(99999L);

    verify(ucsbDiningCommonsMenuItemRepository, times(0))
        .delete(any(UCSBDiningCommonsMenuItem.class));

    Map<String, Object> json = responseToJson(response);

    assertEquals("EntityNotFoundException", json.get("type"));

    assertEquals("UCSBDiningCommonsMenuItem with id 99999 not found", json.get("message"));
  }
}
