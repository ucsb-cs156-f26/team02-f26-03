package edu.ucsb.cs156.example.web;

import static com.microsoft.playwright.assertions.PlaywrightAssertions.assertThat;

import edu.ucsb.cs156.example.WebTestCase;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.test.annotation.DirtiesContext;
import org.springframework.test.annotation.DirtiesContext.ClassMode;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.context.junit.jupiter.SpringExtension;

@ExtendWith(SpringExtension.class)
@SpringBootTest(webEnvironment = SpringBootTest.WebEnvironment.DEFINED_PORT)
@ActiveProfiles("integration")
@DirtiesContext(classMode = ClassMode.BEFORE_EACH_TEST_METHOD)
public class HelpRequestWebIT extends WebTestCase {

  @Test
  public void admin_user_can_create_help_request() throws Exception {

    // Log in as admin
    setupUser(true);

    // Navigate to the HelpRequest creation page
    page.navigate("http://localhost:8080/helprequest/create");

    // Verify that the create page is displayed
    assertThat(page.getByText("Create New HelpRequest")).isVisible();

    // Fill out the form
    page.getByTestId("HelpRequestForm-requesterEmail").fill("student@ucsb.edu");

    page.getByTestId("HelpRequestForm-teamId").fill("team_03");

    page.getByTestId("HelpRequestForm-tableOrBreakoutRoom").fill("table_07");

    page.getByTestId("HelpRequestForm-requestTime").fill("2026-11-02T18:00");

    page.getByTestId("HelpRequestForm-explanation").fill("Need help debugging");

    // Submit the form
    page.getByTestId("HelpRequestForm-submit").click();

    // Verify the created HelpRequest appears in the table
    assertThat(page.getByText("student@ucsb.edu")).isVisible();
    assertThat(page.getByText("Need help debugging")).isVisible();
  }
}
