# D2C Platform - User Interface Components

## Overview

The D2C platform uses a comprehensive set of UI components built on Bootstrap framework with custom enhancements, FontAwesome icons, and specialized widgets for dealership management.

## Icon System (FontAwesome)

### Navigation Icons
- **a-bars** - Hamburger menu toggle
- **a-globe** - Website/site indicators
- **a-external-link** - External link indicators
- **a-gear** - Configuration/settings
- **a-home** - Homepage sections
- **a-automobile** - Vehicle-related sections
- **a-certificate** - Clearance/special offers
- **a-bullhorn** - Promotions and announcements
- **a-dollar** - Financial/pricing sections
- **a-wrench** - Service department
- **a-group** - Team/staff sections
- **a-map-marker** - Location/contact information
- **a-clipboard** - Custom pages and content
- **a-layer-group** - Group management
- **a-image** - Media and banner management
- **a-bar-chart** - Statistics and analytics
- **a-user** - User/lead management
- **a-list-ul** - Detailed listings
- **a-file-text-o** - Reports and documents
- **a-calendar-check-o** - Scheduled items

### User Interface Icons
- **a-user** - User profile
- **a-caret-down** - Dropdown indicators
- **a-clock-o** - Time/availability status
- **a-files-o** - File management
- **a-download** - DMS status
- **a-language** - Language selection
- **a-check** - Confirmation/selection
- **a-unlock-alt** - Password/security
- **a-sign-out** - Logout functionality
- **a-spinner fa-spin** - Loading indicators
- **a-calendar** - Date selection
- **a-arrow-up-right-from-square** - External website links
- **a-circle-info** - Help/information

## Interactive Components

### 1. Bootstrap Switches
**Purpose**: Toggle controls for boolean settings

**Structure**:
`html
<div class="bootstrap-switch-on bootstrap-switch-micro bootstrap-switch bootstrap-switch-wrapper">
    <div class="bootstrap-switch-container">
        <span class="bootstrap-switch-handle-on bootstrap-switch-success">Yes</span>
        <span class="bootstrap-switch-label">&nbsp;</span>
        <span class="bootstrap-switch-handle-off bootstrap-switch-danger">No</span>
        <input type="checkbox" checked="checked">
    </div>
</div>
`

**Examples**:
- **Availability Toggle**: User availability status
- **Site Popups Toggle**: Enable/disable popup notifications
- **Feature Toggles**: Various platform features

**States**:
- **On**: ootstrap-switch-success (green)
- **Off**: ootstrap-switch-danger (red)
- **Micro**: ootstrap-switch-micro (small size)

### 2. Dropdown Menus
**Purpose**: Selection lists and navigation menus

**Types**:

#### User Dropdown
`html
<button class="btn dropdown-toggle btn-default" data-toggle="dropdown">
    <i class="fa fa-user"></i>
    <span>Chris Bemister</span>
    <i class="fa fa-caret-down"></i>
</button>
<ul class="dropdown-menu dropdown-user">
    <!-- Menu items -->
</ul>
`

#### Site Selector
`html
<div class="btn-group bootstrap-select">
    <button class="btn dropdown-toggle btn-default" data-toggle="dropdown">
        <span class="filter-option pull-left">
            <i class="fa fa-fw fa-globe"></i> Site Name
        </span>
        <span class="bs-caret"><span class="caret"></span></span>
    </button>
    <div class="dropdown-menu">
        <div class="bs-searchbox">
            <input type="text" class="form-control" autocomplete="off">
        </div>
        <ul class="dropdown-menu inner">
            <!-- Options -->
        </ul>
    </div>
</div>
`

#### Language Selector
`html
<li class="dropdown dropdown-submenu d2c_navLangdropdown">
    <a href="#" class="dropdown" data-toggle="dropdown">
        <i class="fa fa-language"></i>
        Language
    </a>
    <ul class="dropdown-menu d2c_navLangSubMenu">
        <!-- Language options -->
    </ul>
</li>
`

### 3. Collapsible Sections
**Purpose**: Expandable content areas

**Mobile Navigation**:
`html
<button class="btn btn-primary mobilemenu-trigger" 
        data-toggle="collapse" 
        data-target="#mobileMenu">
    Menu <i class="fa fa-sort-down pull-right"></i>
</button>
<div class="collapse topnav" id="mobileMenu">
    <!-- Menu content -->
</div>
`

**Sidebar Collapse**:
`html
<button class="btn collapsed sidemenu-trigger" 
        data-toggle="collapse" 
        data-target=".navbar-collapse">
    Menu <i class="fa fa-sort-down pull-right"></i>
</button>
`

### 4. Tooltip System
**Purpose**: Contextual help and information display

**Basic Tooltips**:
`html
<a data-toggle="tooltip" title="Tooltip text">Element</a>
<a data-toggle="tooltip-right" title="Right-aligned tooltip">Element</a>
`

**Image Preview Tooltips**:
`html
<span class="input-group-addon tooltip-image-preview" 
      data-content="<img src='image.png' style='max-width: 600px;'>" 
      style="cursor: pointer;">
    <i class="fa fa-image"></i>
</span>
`

**Initialization**:
`javascript
[data-toggle="tooltip"].tooltip();
[data-toggle="tooltip-right"].tooltip({placement:'right'});
`

### 5. Date Range Picker
**Purpose**: Date selection for scheduling and filtering

**Structure**:
`html
<input class="daterange" 
       value='{"start":"2025-06-24","end":"2025-06-30"}'
       onchange="updateDaterange(this)"
       style="display: none;">
<button class="comiseo-daterangepicker-triggerbutton" 
        title="From 2025-06-24 to 2025-06-30">
    <i class="fa fa-calendar"></i>
</button>
`

**Features**:
- Visual date range selection
- JSON format data storage
- Custom trigger buttons
- Color-coded status indicators

### 6. Loading Indicators
**Purpose**: Show processing states

**Spinner Icons**:
`html
<i class="fa fa-spinner fa-spin"></i>
<span><i class="fa fa-large fa-spinner fa-spin"></i></span>
`

**Usage Contexts**:
- AJAX request processing
- DMS status updates
- Form submission states
- Content loading states

### 7. File Upload Components
**Purpose**: Custom file upload interface

**Structure**:
`html
<label class="filebuttonX buttonSmall" afteruploadtext="Modify">
    <span class="buttontext">Add/Modify</span>
    <form action="/ajax/genMultiUpload" method="POST" enctype="multipart/form-data">
        <input type="file" accept="image/*" onchange="fileupload_redirect(event);">
        <input type="hidden" name="siteid" value="2379">
    </form>
</label>
`

**States**:
- **Add**: For new uploads
- **Modify**: For existing files
- **Disabled**: class="disabled" for restricted uploads

### 8. Color Picker Integration
**Purpose**: Color selection for styling

**Implementation**:
`html
<input class="colpick" 
       value="#hexcolor" 
       style="width: 55px; border-radius: 3px 0px 0px 3px;">
<div class="sp-replacer sp-light">
    <div class="sp-preview">
        <div class="sp-preview-inner" style="background-color: rgb(0, 0, 0);"></div>
    </div>
    <div class="sp-dd"></div>
</div>
`

**Features**:
- Spectrum color picker integration
- Live preview
- Hex color validation
- Visual color representation

## Navigation Components

### 1. Breadcrumb Navigation
**Structure**: Three-level hierarchy
- Site Level  Section Level  Page Level
- Visual indicators for current location
- Expandable/collapsible sections

### 2. Sidebar Navigation
**Features**:
- **Active States**: class="active open"
- **Collapsed States**: class="collapse"
- **External Links**: a-external-link icons
- **Connected Users**: Real-time collaboration indicators

### 3. Top Navigation
**Components**:
- **Main Menu**: Horizontal navigation bar
- **User Controls**: Profile, settings, logout
- **Site Selector**: Multi-site switching
- **Help System**: Context-sensitive help

## Responsive Components

### 1. Mobile Adaptations
**Breakpoints**:
- **hidden-xs** - Hidden on extra small screens
- **hidden-sm** - Hidden on small screens
- **pull-right** - Right-aligned elements
- **xs-inline-block** - Mobile display adjustments

### 2. Responsive Navigation
**Mobile Menu**:
- Collapsible hamburger menu
- Touch-friendly interface
- Simplified navigation structure

### 3. Adaptive Layouts
**Grid System**:
- Bootstrap responsive grid
- Flexible column layouts
- Mobile-first design approach

## Interactive Behaviors

### 1. Real-Time Updates
**Connected Users System**:
`html
<i class="menu_connected_users d-none pull-right" data-siteid="2379">
    <span></span>
</i>
`

**DMS Status Updates**:
`javascript
#nbWalkinsInProcessQueue.html('<i class="fa fa-spinner fa-spin"></i>');
$.ajax({
    url: '/adminAjax/GetDMSDataWaitingProcessing',
    success: function(msg) {
        #nbWalkinsInProcessQueue.html(msg.nbWalkins);
    }
});
`

### 2. Dynamic Content Loading
**AJAX Integration**:
- Form submission without page reload
- Real-time data updates
- Progressive content loading

### 3. State Management
**Visual Feedback**:
- Loading states with spinners
- Success/error indicators
- Progress tracking
- Status updates

## Accessibility Features

### 1. ARIA Support
**Attributes**:
- **ria-expanded** - Collapsible state
- **ria-controls** - Control relationships
- **ria-label** - Screen reader labels
- **ole** - Element roles

### 2. Keyboard Navigation
**Support**:
- **	abindex** - Tab order control
- Keyboard shortcuts
- Focus management
- Skip navigation links

### 3. Screen Reader Support
**Features**:
- Semantic HTML structure
- Alternative text for images
- Descriptive link text
- Form label associations

## Custom CSS Classes

### 1. D2C-Specific Classes
- **d2c_navbar_style** - Custom navbar styling
- **d2c_navLangdropdown** - Language dropdown styling
- **d2cDispoText** - Availability text styling
- **ilebuttonX** - Custom file button styling

### 2. Utility Classes
- **ottom-zero** - Remove bottom margin
- **pull-right** - Right alignment
- **hidden** - Hide elements
- **disabled** - Disabled state styling

### 3. Component Classes
- **ootstrap-select** - Enhanced select styling
- **	ooltip-image-preview** - Image tooltip styling
- **comiseo-daterangepicker-triggerbutton** - Date picker styling

---

*This documentation covers all major UI components and interactive elements found in the D2C platform interface.*
