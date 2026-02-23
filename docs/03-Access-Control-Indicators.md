# D2C Platform - Access Control Indicators

## Overview

The D2C platform implements multiple levels of access control to restrict certain features and functionality based on user permissions, subscription levels, and administrative policies.

## Access Restriction Types

### 1. Complete Feature Restrictions
**Indicated by**: HTML comments with "NO ACCESS" markers

**Restricted Features**:
- commercialPage - Commercial page functionality
- changeHistoryPage - Change history tracking
- groupVehicleFeeIncentive - Group vehicle fee incentives
- dataStudio - Data analytics studio
- ollowupManage - Follow-up management system
- utomatedCalls - Automated calling features

**Implementation**:
`html
<!-- NO ACESSS: featureName -->
`

**Impact**: These features are completely unavailable and do not appear in the user interface.

### 2. Disabled Form Elements
**Indicated by**: disabled="disabled" attribute

**Common Disabled Elements**:

#### Logo Upload Restrictions
- **Other_Logo** fields (French and English)
  - Location: Logo management section
  - Reason: Likely requires higher permission level
  - Visual indicator: Grayed out button with "disabled" class

`html
<input disabled="disabled" savefield="Other_Logo" type="file">
<label class="filebuttonX buttonSmall disabled">
`

#### System-Controlled Fields
- **Dealer Name Display**: Read-only field showing dealership name
  - Cannot be modified by users
  - Controlled at system level

`html
<input disabled="" readonly="readonly" value="Capital Chrysler Dodge Jeep Ram">
`

### 3. Read-Only Fields
**Indicated by**: eadonly="readonly" attribute

**Examples**:
- Dealership name display
- System-generated identifiers
- Calculated values
- Historical data fields

**Characteristics**:
- Visible to users
- Cannot be edited
- Often combined with disabled attribute
- Used for reference information

### 4. Hidden Elements
**Indicated by**: style="display:none" or hidden attribute

**Types**:
- Language-specific content not currently active
- Conditional form sections
- Template elements
- System configuration fields

**Examples**:
`html
<div class="SpecialHoursNew" style="display:none;">
<input style="display:none;" data-label="BUTTON_SAVE">
`

### 5. Conditional Visibility
**Indicated by**: JavaScript-controlled display states

**Mechanisms**:
- Form sections that appear/disappear based on selections
- Language-specific content switching
- Feature toggles that reveal additional options

**Example Pattern**:
`javascript
if (condition) {
    .show();
} else {
    .hide();
}
`

## Permission Levels

### Site-Level Permissions
**Scope**: Individual dealership sites
**Identifier**: data-siteid="2379"

**Controls**:
- Site-specific content editing
- Local configuration options
- Dealership-specific features

### Language Permissions
**Scope**: Content language variants
**Identifier**: d2c_language="ENGLISH/FRENCH/INDEPENDENT"

**Controls**:
- Bilingual content management
- Language-specific features
- Regional customizations

### Feature-Level Permissions
**Scope**: Specific platform features
**Implementation**: Checkbox controls with restrictions

**Examples**:
- ALLOW_D2C_TEST_CHECK - D2C testing features
- ALLOW_DEALER_UPLOAD_BANNERS - Banner upload capability
- RESPONSIVE_EDITOR_ENABLED - Advanced editor access

## User Role Indicators

### Connected Users System
**Purpose**: Shows when multiple users are editing the same section
**Indicator**: class="menu_connected_users d-none pull-right"
**Data**: data-siteid="2379"

**Functionality**:
- Real-time collaboration awareness
- Prevents editing conflicts
- Shows active user count per section

### User Status Controls
**Available in**: User dropdown menu

**Status Types**:
- **Availability Toggle**: Available/Not Available
- **Site Popups**: Enabled/Disabled
- **Language Preference**: English/French

## Access Control Patterns

### 1. Progressive Disclosure
Features are revealed based on:
- User permission level
- Previous selections
- Account type
- Subscription status

### 2. Graceful Degradation
Restricted features:
- Show as disabled rather than hidden
- Provide visual feedback about restrictions
- Maintain interface consistency

### 3. Contextual Restrictions
Access varies by:
- Current page/section
- Selected dealership
- Time-based permissions
- Geographic restrictions

## Visual Indicators

### CSS Classes for Restrictions
- **disabled** - Grayed out, non-interactive elements
- **eadonly** - Visible but non-editable fields
- **hidden-xs** - Responsive hiding on small screens
- **d-none** - Bootstrap utility for hiding elements

### Button States
- **uttonSmall disabled** - Disabled file upload buttons
- **tn-default** - Standard interactive buttons
- **tn-primary** - Primary action buttons

### Form Field States
- **Disabled inputs**: Gray background, no cursor interaction
- **Readonly inputs**: Normal appearance, no editing capability
- **Hidden inputs**: Not visible, used for system data

## Permission Checking Mechanisms

### JavaScript Validation
`javascript
function isD2CEmployee() {
    return false; // User permission check
}
`

### Server-Side Controls
- Form submission validation
- File upload restrictions
- Data access limitations
- Feature availability checks

### Client-Side Restrictions
- UI element hiding/showing
- Form field enabling/disabling
- Menu item availability
- Button state management

## Common Restriction Scenarios

### 1. File Upload Limitations
- Certain logo types restricted
- File size limitations
- Format restrictions
- Upload location permissions

### 2. Content Editing Restrictions
- System-generated content (read-only)
- Template-based content (limited editing)
- Shared content (permission-based editing)
- Historical content (view-only)

### 3. Feature Access Limitations
- Advanced analytics (subscription-based)
- Automation features (permission-based)
- Multi-site management (role-based)
- System administration (admin-only)

### 4. Language-Specific Restrictions
- Content available only in certain languages
- Region-specific features
- Localization limitations
- Translation tool access

## Troubleshooting Access Issues

### Common Problems
1. **Grayed out buttons**: Check user permissions
2. **Missing menu items**: Verify feature access level
3. **Read-only fields**: Confirm editing permissions
4. **Hidden sections**: Check conditional display logic

### Diagnostic Steps
1. Check user role and permissions
2. Verify site-specific access rights
3. Confirm feature subscription status
4. Review browser console for JavaScript errors
5. Test with different user accounts

### Escalation Path
1. **Local Issues**: Check user settings and permissions
2. **Site Issues**: Contact site administrator
3. **Platform Issues**: Contact D2C Media support
4. **Feature Requests**: Submit through proper channels

---

*This documentation covers all access control mechanisms and restrictions found in the D2C platform interface.*
