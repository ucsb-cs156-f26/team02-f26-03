package edu.ucsb.cs156.example.integration;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertFalse;
import static org.springframework.security.test.web.servlet.request.SecurityMockMvcRequestPostProcessors.csrf;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;
import edu.ucsb.cs156.example.entities.Articles;
import edu.ucsb.cs156.example.repositories.ArticlesRepository;
import edu.ucsb.cs156.example.repositories.UserRepository;
import edu.ucsb.cs156.example.services.CurrentUserService;
import edu.ucsb.cs156.example.services.GrantedAuthoritiesService;
import edu.ucsb.cs156.example.testconfig.TestConfig;
import java.time.LocalDateTime;
import java.util.Map;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.context.annotation.Import;
import org.springframework.http.MediaType;
import org.springframework.security.test.context.support.WithMockUser;
import org.springframework.test.annotation.DirtiesContext;
import org.springframework.test.annotation.DirtiesContext.ClassMode;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.context.bean.override.mockito.MockitoBean;
import org.springframework.test.context.junit.jupiter.SpringExtension;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.MvcResult;

@ExtendWith(SpringExtension.class)
@SpringBootTest(webEnvironment = SpringBootTest.WebEnvironment.RANDOM_PORT)
@AutoConfigureMockMvc
@ActiveProfiles("integration")
@Import(TestConfig.class)
@DirtiesContext(classMode = ClassMode.BEFORE_EACH_TEST_METHOD)
public class ArticlesIT {
  @Autowired public CurrentUserService currentUserService;

  @Autowired public GrantedAuthoritiesService grantedAuthoritiesService;

  @Autowired ArticlesRepository articlesRepository;

  @Autowired public MockMvc mockMvc;

  @Autowired public ObjectMapper mapper;

  @MockitoBean UserRepository userRepository;

  @WithMockUser(roles = {"USER"})
  @Test
  public void test_that_logged_in_user_can_get_by_id_when_the_id_exists() throws Exception {
    // arrange

    Articles article =
        Articles.builder()
            .title("Gauchos Win Big")
            .url("https://dailynexus.com/gauchos-win-big")
            .explanation("UCSB wins the championship")
            .email("reporter@ucsb.edu")
            .dateAdded(LocalDateTime.parse("2022-01-03T00:00:00"))
            .build();

    articlesRepository.save(article);

    // act
    MvcResult response =
        mockMvc.perform(get("/api/articles?id=1")).andExpect(status().isOk()).andReturn();

    // assert
    String expectedJson = mapper.writeValueAsString(article);
    String responseString = response.getResponse().getContentAsString();
    assertEquals(expectedJson, responseString);
  }

  @WithMockUser(roles = {"ADMIN", "USER"})
  @Test
  public void an_admin_user_can_post_a_new_article() throws Exception {
    // arrange

    Articles article1 =
        Articles.builder()
            .id(1L)
            .title("Gauchos Win Big")
            .url("https://dailynexus.com/gauchos-win-big")
            .explanation("UCSB wins the championship")
            .email("reporter@ucsb.edu")
            .dateAdded(LocalDateTime.parse("2022-01-03T00:00:00"))
            .build();

    // act
    MvcResult response =
        mockMvc
            .perform(
                post("/api/articles/post")
                    .param("title", "Gauchos Win Big")
                    .param("url", "https://dailynexus.com/gauchos-win-big")
                    .param("explanation", "UCSB wins the championship")
                    .param("email", "reporter@ucsb.edu")
                    .param("dateAdded", "2022-01-03T00:00:00")
                    .with(csrf()))
            .andExpect(status().isOk())
            .andReturn();

    // assert
    String expectedJson = mapper.writeValueAsString(article1);
    String responseString = response.getResponse().getContentAsString();
    assertEquals(expectedJson, responseString);
    assertEquals(article1, articlesRepository.findById(1L).get());
  }

  @WithMockUser(roles = {"ADMIN", "USER"})
  @Test
  public void an_admin_user_can_edit_an_existing_article() throws Exception {
    // arrange

    Articles articleOrig =
        Articles.builder()
            .title("Gauchos Win Big")
            .url("https://dailynexus.com/gauchos-win-big")
            .explanation("UCSB wins the championship")
            .email("reporter@ucsb.edu")
            .dateAdded(LocalDateTime.parse("2022-01-03T00:00:00"))
            .build();

    articlesRepository.save(articleOrig);

    Articles articleEdited =
        Articles.builder()
            .id(1L)
            .title("Gauchos Win Bigger")
            .url("https://dailynexus.com/gauchos-win-bigger")
            .explanation("UCSB wins again")
            .email("editor@ucsb.edu")
            .dateAdded(LocalDateTime.parse("2023-04-05T06:07:08"))
            .build();

    String requestBody = mapper.writeValueAsString(articleEdited);

    // act
    MvcResult response =
        mockMvc
            .perform(
                put("/api/articles?id=1")
                    .contentType(MediaType.APPLICATION_JSON)
                    .characterEncoding("utf-8")
                    .content(requestBody)
                    .with(csrf()))
            .andExpect(status().isOk())
            .andReturn();

    // assert
    String responseString = response.getResponse().getContentAsString();
    assertEquals(requestBody, responseString);
    assertEquals(articleEdited, articlesRepository.findById(1L).get());
  }

  @WithMockUser(roles = {"ADMIN", "USER"})
  @Test
  public void an_admin_user_can_delete_an_article() throws Exception {
    // arrange

    Articles article =
        Articles.builder()
            .title("Gauchos Win Big")
            .url("https://dailynexus.com/gauchos-win-big")
            .explanation("UCSB wins the championship")
            .email("reporter@ucsb.edu")
            .dateAdded(LocalDateTime.parse("2022-01-03T00:00:00"))
            .build();

    articlesRepository.save(article);

    // act
    MvcResult response =
        mockMvc
            .perform(delete("/api/articles?id=1").with(csrf()))
            .andExpect(status().isOk())
            .andReturn();

    // assert
    Map<String, Object> json =
        mapper.readValue(
            response.getResponse().getContentAsString(),
            new TypeReference<Map<String, Object>>() {});
    assertEquals("Article with id 1 deleted", json.get("message"));
    assertFalse(articlesRepository.findById(1L).isPresent());
  }
}
