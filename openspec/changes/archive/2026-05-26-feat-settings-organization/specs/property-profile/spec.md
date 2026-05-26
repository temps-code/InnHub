# Delta for Property Profile

## ADDED Requirements

### Requirement: Responsive Read-Only Field Layout

In read-only mode, the system MUST render field descriptors (ID, Slug, created_at, updated_at) dynamically based on viewport width to guarantee readability and avoid text clipping.

#### Scenario: Fields stack on mobile viewports

- GIVEN the property profile is in read-only mode
- WHEN the viewport width is narrower than 640px
- THEN the field descriptors (ID, Slug, created_at, updated_at) MUST stack vertically

#### Scenario: Fields align to two-column grid on desktop

- GIVEN the property profile is in read-only mode
- WHEN the viewport width is 640px or wider
- THEN the field descriptors (ID, Slug, created_at, updated_at) MUST align to a two-column grid

## MODIFIED Requirements

## REMOVED Requirements
