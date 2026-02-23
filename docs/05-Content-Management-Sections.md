# D2C Platform - Content Management Sections

## Overview

The D2C platform organizes content management into expandable sections using a hierarchical structure. Each section contains specific configuration options and editable content areas for different aspects of the dealership website.

## Section Organization System

### Expandable Section Structure
All content sections use a consistent expandable interface:

`html
<h5 class="expandablesection open" 
    expandablecontainer="section-container" 
    expandablestatus="open">
    <span class="first expandableHeaderText">Section Title</span>
</h5>
<div id="section-container" style="display: block;">
    <!-- Section content -->
</div>
`

**States**:
- **open** - Section is expanded and visible
- **closed** - Section is collapsed and hidden
- **expandablestatus** - Controls initial display state

## Main Content Management Categories

### 1. Contact Information & Coordinates

#### Coordinates - Main
**Purpose**: Primary dealership contact information
**Container**: coordinatesmain-container
**Content**:
- Primary address and phone numbers
- Main business hours
- Contact person information
- General dealership details

#### Coordinates - New (Vehicles)
**Purpose**: New vehicle department contact information
**Container**: 	able_new_coordinates
**Content**:
- New vehicle sales contact details
- Department-specific hours
- Sales team information
- New vehicle inquiry handling

#### Coordinates - Used (Vehicles)
**Purpose**: Used vehicle department contact information
**Container**: 	able_used_coordinates
**Content**:
- Used vehicle sales contact details
- Pre-owned department hours
- Used vehicle sales team
- Trade-in information

#### Coordinates - Service
**Purpose**: Service department contact information
**Container**: 	able_service_coordinates
**Content**:
- Service department contact details
- Service hours and scheduling
- Service advisor information
- Emergency service contacts

#### Coordinates - Parts & Accessories
**Purpose**: Parts department contact information
**Container**: 	able_parts_coordinates
**Content**:
- Parts department contact details
- Parts counter hours
- Parts specialist information
- Parts ordering information

#### Coordinates - Financing
**Purpose**: Finance department contact information
**Container**: 	able_finance
**Content**:
- Finance manager contact details
- Finance department hours
- Loan and lease information
- Credit application processing

#### Other Opening Hours
**Purpose**: Special hours and holiday schedules
**Container**: 	able_other_coordinates
**Content**:
- Holiday hours
- Special event hours
- Seasonal schedule changes
- Emergency contact information

### 2. Multi-Location Management

#### Multi-site Addresses
**Purpose**: Manage multiple dealership locations
**Container**: multilocation--container
**Content**:
- Multiple location addresses
- Location-specific contact information
- Branch-specific services
- Location selection interface

**Dynamic Sections**:
`html
<h5 class="expandablesection open" 
    expandablecontainer="MULTI_LOCATION-body" 
    expandablestatus="open">
    <span class="expandableHeaderText">Location #{INDEX} {DEALER_NAME}</span>
    <button id="MULTI_LOCATION-delete" type="button" class="buttonSmall">
        Delete Location
    </button>
</h5>
`

### 3. Website Navigation & Structure

#### Main Menu Active Tabs
**Purpose**: Configure main website navigation
**Container**: ctivetabs-container
**Content**:
- Navigation menu items
- Tab visibility settings
- Menu order configuration
- Link destinations

#### Row Under the Menu
**Purpose**: Configure sub-navigation elements
**Container**: 	radeinbar-container
**Content**:
- Secondary navigation bar
- Trade-in value tools
- Quick action buttons
- Promotional banners

#### Mobile Navigation
**Purpose**: Mobile-specific navigation settings
**Container**: mobile_navigation
**Content**:
- Mobile menu configuration
- Touch-friendly navigation
- Mobile-specific features
- Responsive behavior settings

#### Footer Links
**Purpose**: Website footer configuration
**Container**: 	able_footer_links
**Content**:
- Footer navigation links
- Legal page links
- Social media links
- Contact information links

### 4. Visual Design & Styling

#### Background, Headers and Responsive Design
**Purpose**: Overall website appearance
**Container**: gheader-container
**Content**:
- Background colors and images
- Header styling options
- Responsive design settings
- Layout configurations

#### Main Menu (Colors)
**Purpose**: Navigation styling
**Container**: 	abbuttons-container
**Content**:
- Menu button colors
- Hover effects
- Active state styling
- Typography settings

#### Mobile Home Page Menu
**Purpose**: Mobile homepage navigation
**Container**: mobilehome-container
**Content**:
- Mobile homepage layout
- Touch-optimized buttons
- Mobile-specific features
- Responsive adjustments

#### Mobile Burger Menu
**Purpose**: Mobile hamburger menu styling
**Container**: mobilemenu-container
**Content**:
- Burger menu appearance
- Mobile navigation styling
- Collapsible menu behavior
- Mobile user experience

#### Footer & Promo Button Colors
**Purpose**: Footer and promotional element styling
**Container**: colors-container
**Content**:
- Footer color schemes
- Promotional button styling
- Call-to-action colors
- Brand color consistency

#### Type Fonts
**Purpose**: Typography configuration
**Container**: 	ypefont-container
**Content**:
- Font family selection
- Font size settings
- Text styling options
- Typography hierarchy

### 5. Branding & Identity

#### Logo
**Purpose**: Main logo management
**Container**: logosection-container
**Content**:
- Primary logo upload
- Logo sizing options
- Logo positioning
- Alternative logo versions

#### Favicon Logo
**Purpose**: Browser icon management
**Container**: logofavicon-container
**Content**:
- Favicon upload (16x16 or 32x32)
- Browser tab icon
- Bookmark icon
- Mobile app icon

#### Favorites
**Purpose**: Browser favorites configuration
**Container**: avorites-container
**Content**:
- Bookmark icon settings
- Favorites appearance
- Browser integration
- Mobile bookmark options

### 6. Forms & Lead Management

#### Forms Options
**Purpose**: General form configuration
**Container**: ormoptions-container
**Content**:
- Form field requirements
- Validation settings
- Form styling options
- Submission handling

#### 'Sell Us Your Car' Form
**Purpose**: Trade-in form configuration
**Container**: 	able_sellcar_form
**Content**:
- Trade-in form fields
- Vehicle information capture
- Appraisal request handling
- Trade-in process workflow

#### Surveys
**Purpose**: Customer feedback forms
**Container**: surveys-container
**Content**:
- Survey question configuration
- Customer satisfaction forms
- Feedback collection
- Survey result handling

#### Post Form Submission Questions
**Purpose**: Follow-up question configuration
**Container**: postlead-container
**Content**:
- Post-submission surveys
- Additional information capture
- Lead qualification questions
- Customer preference collection

### 7. Alerts & Notifications

#### Header Horizontal Row Alert
**Purpose**: Top-of-page alert banners
**Container**: 	able_horizontal_bar
**Content**:
- Emergency notifications
- Promotional alerts
- Important announcements
- Site-wide messages

#### Toaster Alert
**Purpose**: Popup notification system
**Container**: 	able_toaster_alert
**Content**:
- Popup alert configuration
- Notification timing
- Alert styling
- User interaction options

### 8. Technical Integration

#### HTML Code to Inject
**Purpose**: Custom code integration
**Container**: 	able_html_to_insert
**Content**:
- Custom HTML injection
- Third-party integrations
- Tracking code installation
- Custom functionality

#### Cookies & Scripts Consent Management
**Purpose**: Privacy compliance management
**Container**: cookieConsent-container
**Content**:
- Cookie consent banners
- Privacy policy compliance
- Script management
- GDPR compliance tools

#### Cookies Found
**Purpose**: Cookie tracking and management
**Container**: cookiesFound-container
**Content**:
- Active cookie inventory
- Cookie categorization
- Privacy impact assessment
- Consent tracking

#### Privacy Policy & Terms and Conditions
**Purpose**: Legal document management
**Container**: 	able_terms_conditions
**Content**:
- Privacy policy content
- Terms and conditions text
- Legal compliance documents
- Policy update management

## Content Types and Customization Options

### 1. Editable Text Content
**Implementation**: Rich text editors (CKEditor)
**Features**:
- HTML formatting
- Image insertion
- Link management
- Responsive content

### 2. Image Management
**Implementation**: File upload systems
**Features**:
- Image cropping tools
- Multiple format support
- Responsive image handling
- Alt text management

### 3. Color Customization
**Implementation**: Color picker tools
**Features**:
- Brand color consistency
- Hex color selection
- Visual color preview
- Theme coordination

### 4. Form Configuration
**Implementation**: Dynamic form builders
**Features**:
- Field requirement settings
- Validation rules
- Conditional logic
- Integration options

### 5. Multilingual Content
**Implementation**: Language-specific fields
**Features**:
- French/English content variants
- Language-independent settings
- Translation management
- Localization options

## Section Management Features

### 1. Expandable Interface
**Benefits**:
- Organized content structure
- Reduced visual clutter
- Focused editing experience
- Logical content grouping

### 2. Real-Time Collaboration
**Features**:
- Connected user indicators
- Concurrent editing prevention
- Change tracking
- User activity monitoring

### 3. Auto-Save Functionality
**Implementation**:
- Automatic content saving
- Change detection
- Recovery options
- Version management

### 4. Validation Systems
**Features**:
- Content validation
- HTML injection protection
- Error prevention
- Quality assurance

## Best Practices for Content Management

### 1. Section Organization
- Work through sections systematically
- Complete related sections together
- Use consistent naming conventions
- Maintain content hierarchy

### 2. Content Quality
- Use appropriate image sizes
- Maintain brand consistency
- Follow accessibility guidelines
- Test responsive behavior

### 3. Form Management
- Configure required fields appropriately
- Test form submission workflows
- Ensure proper validation
- Monitor form performance

### 4. Technical Integration
- Validate custom code before injection
- Test third-party integrations
- Monitor performance impact
- Maintain security standards

---

*This documentation covers all content management sections and customization options available in the D2C platform.*
