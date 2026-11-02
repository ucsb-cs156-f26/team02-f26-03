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
public class UCSBDiningCommonsMenuItemWebIT extends WebTestCase {

  @Test
  public void admin_user_can_create_menu_item() throws Exception {

    // Step 1: Log in as an admin
    setupUser(true);

    // Step 2: Navigate to the Menu Item page
    page.getByText("UCSBDiningCommonsMenuItem").click();

    // Step 3: Open the Create page
    page.getByText("Create Menu Item").click();

    assertThat(page.getByText("Create New Menu Item")).isVisible();

    // Step 4: Fill in the form
    page.getByTestId("UCSBDiningCommonsMenuItemForm-diningCommonsCode").fill("dlg");

    page.getByTestId("UCSBDiningCommonsMenuItemForm-name").fill("Playwright Test Chicken");

    page.getByTestId("UCSBDiningCommonsMenuItemForm-station").fill("Grill");

    // Step 5: Submit the form
    page.getByTestId("UCSBDiningCommonsMenuItemForm-submit").click();

    // Step 6: Verify the new item appears in the table
    assertThat(
            page.getByTestId("UCSBDiningCommonsMenuItemTable").getByText("Playwright Test Chicken"))
        .isVisible();
  }
}
