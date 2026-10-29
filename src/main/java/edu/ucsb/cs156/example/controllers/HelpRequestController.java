package edu.ucsb.cs156.example.controllers;

import edu.ucsb.cs156.example.entities.HelpRequest;
import edu.ucsb.cs156.example.errors.EntityNotFoundException;
import edu.ucsb.cs156.example.repositories.HelpRequestRepository;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.tags.Tag;
import java.time.LocalDateTime;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

/** REST controller for help requests. */
@Tag(name = "HelpRequest")
@RequestMapping("/api/HelpRequest")
@RestController
@Slf4j
public class HelpRequestController extends ApiController {

  @Autowired HelpRequestRepository helpRequestRepository;

  /** List all help requests. */
  @Operation(summary = "List all help requests")
  @PreAuthorize("hasRole('ROLE_USER')")
  @GetMapping("/all")
  public Iterable<HelpRequest> allHelpRequests() {
    return helpRequestRepository.findAll();
  }

  /** Create a new help request. */
  @Operation(summary = "Create a new help request")
  @PreAuthorize("hasRole('ROLE_ADMIN')")
  @PostMapping("/post")
  public HelpRequest postHelpRequest(
      @Parameter(description = "Email of the person requesting help") @RequestParam
          String requesterEmail,
      @Parameter(description = "Team identifier") @RequestParam String teamId,
      @Parameter(description = "Table number or breakout room") @RequestParam
          String tableOrBreakoutRoom,
      @Parameter(description = "Request time in ISO format, e.g. 2026-10-20T11:30:00")
          @RequestParam("requestTime")
          @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME)
          LocalDateTime requestTime,
      @Parameter(description = "Description of the help needed") @RequestParam String explanation,
      @Parameter(description = "Whether the request has been resolved") @RequestParam
          boolean solved) {

    HelpRequest helpRequest = new HelpRequest();
    helpRequest.setRequesterEmail(requesterEmail);
    helpRequest.setTeamId(teamId);
    helpRequest.setTableOrBreakoutRoom(tableOrBreakoutRoom);
    helpRequest.setRequestTime(requestTime);
    helpRequest.setExplanation(explanation);
    helpRequest.setSolved(solved);

    return helpRequestRepository.save(helpRequest);
  }

  /**
   * Get a single help request by id.
   *
   * @param id the id of the help request
   * @return the matching help request
   */
  @Operation(summary = "Get a single help request by id")
  @PreAuthorize("hasRole('ROLE_USER')")
  @GetMapping("")
  public HelpRequest getById(
      @Parameter(name = "id", description = "ID of the help request") @RequestParam Long id) {

    return helpRequestRepository
        .findById(id)
        .orElseThrow(() -> new EntityNotFoundException(HelpRequest.class, id));
  }

  /**
   * Update an existing help request.
   *
   * @param id the id of the help request to update
   * @param incoming the new field values
   * @return the updated help request
   */
  @Operation(
      summary = "Update a single help request",
      description =
          "Finds a help request using the query parameter id and replaces all six "
              + "editable fields with the JSON request body values. "
              + "The existing id is preserved. Requires ADMIN role. "
              + "Returns 404 if the help request does not exist.")
  @PreAuthorize("hasRole('ROLE_ADMIN')")
  @PutMapping("")
  public HelpRequest updateHelpRequest(
      @Parameter(description = "ID of the help request to update") @RequestParam Long id,
      @RequestBody HelpRequest incoming) {

    HelpRequest existing =
        helpRequestRepository
            .findById(id)
            .orElseThrow(() -> new EntityNotFoundException(HelpRequest.class, id));

    existing.setRequesterEmail(incoming.getRequesterEmail());
    existing.setTeamId(incoming.getTeamId());
    existing.setTableOrBreakoutRoom(incoming.getTableOrBreakoutRoom());
    existing.setRequestTime(incoming.getRequestTime());
    existing.setExplanation(incoming.getExplanation());
    existing.setSolved(incoming.getSolved());

    return helpRequestRepository.save(existing);
  }

  /**
   * Delete a single help request. Accessible only to admins.
   *
   * @param id the id of the help request to delete
   * @return a message indicating the help request was deleted
   */
  @Operation(summary = "Delete a help request by id (admin only)")
  @PreAuthorize("hasRole('ROLE_ADMIN')")
  @DeleteMapping("")
  public Object deleteHelpRequest(
      @Parameter(name = "id", description = "ID of the help request to delete") @RequestParam
          Long id) {
    HelpRequest helpRequest =
        helpRequestRepository
            .findById(id)
            .orElseThrow(() -> new EntityNotFoundException(HelpRequest.class, id));

    helpRequestRepository.delete(helpRequest);
    return genericMessage("HelpRequest with id %s deleted".formatted(id));
  }
}
