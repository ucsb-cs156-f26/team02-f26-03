package edu.ucsb.cs156.example.web;

import static com.microsoft.playwright.assertions.PlaywrightAssertions.assertThat;

import com.microsoft.playwright.Page;
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
public class UCSBOrganizationWebIT extends WebTestCase {
  @Test
  public void admin_user_can_create_edit_delete_organization() throws Exception {
    setupUser(true);

    page.getByText("Organization").click();

    page.getByText("Create Organization").click();
    assertThat(page.getByText("Create New Organization")).isVisible();

    page.getByLabel("Organization Code", new Page.GetByLabelOptions().setExact(true)).fill("ZPR");
    page.getByLabel("Short Organization Code Translation").fill("ZETA PHI RHO");
    page.getByLabel("Organization Code Translation", new Page.GetByLabelOptions().setExact(true))
        .fill("ZETA PHI RHO");

    page.getByLabel("Inactive").selectOption("false");

    page.getByText("Create", new Page.GetByTextOptions().setExact(true)).click();

    assertThat(page.getByTestId("UCSBOrganizationTable-cell-row-0-col-orgTranslation"))
        .hasText("ZETA PHI RHO");

    page.getByTestId("UCSBOrganizationTable-cell-row-0-col-Edit-button").click();
    assertThat(page.getByText("Edit Organization")).isVisible();

    page.getByLabel("Organization Code Translation", new Page.GetByLabelOptions().setExact(true))
        .fill("ZETA PHI RHO FRATERNITY");

    page.getByLabel("Inactive").selectOption("false");

    page.getByText("Update", new Page.GetByTextOptions().setExact(true)).click();

    assertThat(page.getByTestId("UCSBOrganizationTable-cell-row-0-col-orgTranslation"))
        .hasText("ZETA PHI RHO FRATERNITY");

    page.getByTestId("UCSBOrganizationTable-cell-row-0-col-Delete-button").click();

    assertThat(page.getByTestId("UCSBOrganizationTable-cell-row-0-col-orgCode")).not().isVisible();
  }

  @Test
  public void regular_user_cannot_create_organization() throws Exception {
    setupUser(false);

    page.getByText("Organization").click();

    assertThat(page.getByText("Create Organization")).not().isVisible();
    assertThat(page.getByTestId("UCSBOrganizationTable-cell-row-0-col-orgCode")).not().isVisible();
  }

  @Test
  public void admin_user_can_see_create_organization() throws Exception {
    setupUser(true);

    page.getByText("Organization").click();

    assertThat(page.getByText("Create Organization")).isVisible();
  }
}
