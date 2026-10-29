package edu.ucsb.cs156.example.controllers;

import edu.ucsb.cs156.example.entities.UCSBDiningCommonsMenuItem;
import edu.ucsb.cs156.example.errors.EntityNotFoundException;
import edu.ucsb.cs156.example.repositories.UCSBDiningCommonsMenuItemRepository;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

/** REST controller for UCSB Dining Commons menu items. */
@Tag(name = "UCSBDiningCommonsMenuItem")
@RequestMapping("/api/UCSBDiningCommonsMenuItem")
@RestController
@Slf4j
public class UCSBDiningCommonsMenuItemController extends ApiController {
  @Autowired UCSBDiningCommonsMenuItemRepository ucsbDiningCommonsMenuItemRepository;

  /**
   * List all UCSB Dining Commons menu items.
   *
   * @return an iterable of UCSBDiningCommonsMenuItem
   */
  @Operation(summary = "List all UCSB Dining Commons menu items")
  @PreAuthorize("hasRole('ROLE_USER')")
  @GetMapping("/all")
  public Iterable<UCSBDiningCommonsMenuItem> allMenuItems() {
    Iterable<UCSBDiningCommonsMenuItem> items = ucsbDiningCommonsMenuItemRepository.findAll();
    return items;
  }

  /** Create a new UCSB Dining Commons menu item. */
  @Operation(summary = "Create a new UCSB Dining Commons menu item")
  @PreAuthorize("hasRole('ROLE_ADMIN')")
  @PostMapping("/post")
  public UCSBDiningCommonsMenuItem postMenuItem(
      @Parameter(name = "diningCommonsCode") @RequestParam String diningCommonsCode,
      @Parameter(name = "name") @RequestParam String name,
      @Parameter(name = "station") @RequestParam String station) {
    log.info("Creating menu item: {}", name);
    UCSBDiningCommonsMenuItem item = new UCSBDiningCommonsMenuItem();
    item.setDiningCommonsCode(diningCommonsCode);
    item.setName(name);
    item.setStation(station);

    UCSBDiningCommonsMenuItem savedItem = ucsbDiningCommonsMenuItemRepository.save(item);

    return savedItem;
  }

  /**
   * Get a single UCSB Dining Commons menu item by ID.
   *
   * @param id the ID of the menu item
   * @return the menu item with the specified ID
   */
  @Operation(summary = "Get a single UCSB Dining Commons menu item by ID")
  @PreAuthorize("hasRole('ROLE_USER')")
  @GetMapping("")
  public UCSBDiningCommonsMenuItem getById(
      @Parameter(name = "id", description = "ID of the menu item to retrieve") @RequestParam
          Long id) {
    UCSBDiningCommonsMenuItem item =
        ucsbDiningCommonsMenuItemRepository
            .findById(id)
            .orElseThrow(() -> new EntityNotFoundException(UCSBDiningCommonsMenuItem.class, id));
    return item;
  }

  /**
   * Update a single UCSB Dining Commons menu item.
   *
   * @param id the ID of the item to update
   * @param incoming the new values for the item
   * @return the updated menu item
   */
  @Operation(summary = "Update a single UCSB Dining Commons menu item")
  @PreAuthorize("hasRole('ROLE_ADMIN')")
  @PutMapping("")
  public UCSBDiningCommonsMenuItem updateMenuItem(
      @Parameter(name = "id") @RequestParam Long id,
      @RequestBody @Valid UCSBDiningCommonsMenuItem incoming) {

    UCSBDiningCommonsMenuItem item =
        ucsbDiningCommonsMenuItemRepository
            .findById(id)
            .orElseThrow(() -> new EntityNotFoundException(UCSBDiningCommonsMenuItem.class, id));

    item.setDiningCommonsCode(incoming.getDiningCommonsCode());
    item.setName(incoming.getName());
    item.setStation(incoming.getStation());

    ucsbDiningCommonsMenuItemRepository.save(item);

    return item;
  }

  /**
   * Delete a UCSB Dining Commons menu item.
   *
   * @param id the ID of the menu item to delete
   * @return a message indicating the item was deleted
   */
  @Operation(summary = "Delete a UCSB Dining Commons menu item")
  @PreAuthorize("hasRole('ROLE_ADMIN')")
  @DeleteMapping("")
  public Object deleteMenuItem(@Parameter(name = "id") @RequestParam Long id) {

    UCSBDiningCommonsMenuItem item =
        ucsbDiningCommonsMenuItemRepository
            .findById(id)
            .orElseThrow(() -> new EntityNotFoundException(UCSBDiningCommonsMenuItem.class, id));

    ucsbDiningCommonsMenuItemRepository.delete(item);

    return genericMessage("UCSBDiningCommonsMenuItem with id %s deleted".formatted(id));
  }
}
