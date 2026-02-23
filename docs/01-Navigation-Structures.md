# D2C Platform - Navigation Structures

## Main Navigation Hierarchy

### Top-Level Navigation (Desktop)
Located in: div.topnav#desktopnav

1. **Home** (/home)
   - ID: MNAV_Home
   - Purpose: Dashboard and overview

2. **Inventory** (/inventory) 
   - ID: MNAV_Inventory
   - Purpose: Vehicle inventory management

3. **My Sites** (/sites)
   - ID: MNAV_Sites 
   - Purpose: Website configuration and content management
   - Status: Currently active section

4. **Media** (/media)
   - ID: MNAV_Media
   - Purpose: Media asset management

5. **Contacts** (/contacts)
   - ID: MNAV_Contacts
   - Purpose: Contact and lead management

### Mobile Navigation
Located in: div#mobiletopnav

- **Trigger**: Button with class mobilemenu-trigger
- **Target**: Collapsible menu div#mobileMenu
- **Structure**: Same menu items as desktop but in collapsible format
- **Behavior**: Bootstrap collapse functionality

### Sidebar Navigation (Left Panel)
Located in: div.navbar-default.sidebar > div.sidebar-nav.navbar-collapse > ul.nav#side-menu

#### Three-Level Hierarchy:

**Level 1: Site Selection**
- **Capitaljeep.com** (Site ID: 2379)
  - Icon: a-globe
  - External link to live website
  - Status: ctive open

**Level 2: Main Sections**
1. **Configurator** (sites/config)
   - Icon: a-gear
   - Purpose: Website content management
   - Status: ctive open

2. **Group Mgmt** (sites/groupmgmt)
   - Icon: a-layer-group
   - Purpose: Multi-site management
   - Status: collapsed

3. **Statistics** (sites/stats)
   - Icon: a-bar-chart
   - Purpose: Analytics and reporting
   - Status: collapsed

**Level 3: Page-Specific Options**

Under **Configurator**:
- General (/sites/general) - a-info-circle
- Homepage (/sites/homepage) - a-home [ACTIVE]
- New (/sites/new-vehicles) - a-automobile
- Demo (/sites/demo) - a-automobile
- Pre-owned (/sites/used-vehicles) - a-automobile
- Clearance (/sites/clearance) - a-certificate
- Promotions (/sites/promotions) - a-bullhorn
- Financing (/sites/financing) - a-dollar
- Service (/sites/services) - a-wrench
- Our team (/sites/our-team) - a-group
- Contact us (/sites/contact-us) - a-map-marker
- Custom pages (/sites/custom-pages) - a-clipboard

Under **Group Mgmt**:
- Banners (/sites/groupbanners) - a-image
- Promotions (/sites/grouppromotions) - a-bullhorn
- Custom Pages (/sites/groupcustompages) - a-clipboard

Under **Statistics**:
- Leads (D2C Site) (/sites/leads) - a-user
- Lead details (/sites/details-of-leads) - a-list-ul
- ADF leads (/sites/reportsadfleads) - a-file-text-o
- Scheduled Reports (/sites/scheduledreports) - a-calendar-check-o

## Navigation Features

### Connected Users Indicator
- Class: menu_connected_users d-none pull-right
- Data attribute: data-siteid="2379"
- Purpose: Shows when other users are editing the same section

### External Link Indicators
- Class: a-external-link pull-right
- Behavior: onclick="window.open('https://capitaljeep.com');"
- Purpose: Direct access to live website sections

### Navigation States
- **Active**: class="active open" - Currently selected section
- **Collapsed**: class="collapse" - Hidden submenu
- **Expanded**: class="collapse in" - Visible submenu

### Responsive Behavior
- **Desktop**: Full sidebar navigation visible
- **Mobile**: Collapsible hamburger menu
- **Tablet**: Adaptive layout with burger toggle

## Header Navigation Elements

### User Menu (Top Right)
Located in: ul.nav.navbar-top-links.navbar-right

1. **Need Help Button**
   - ID: 
eedHelp
   - Function: 
eedHelpContactForm()
   - Visibility: Hidden on mobile (hidden-xs)

2. **User Dropdown**
   - ID: 	opNavbarUserBtn
   - User: "Chris Bemister"
   - Contains:
     - Availability toggle
     - Site popups toggle
     - DMS Status submenu
     - Language switcher
     - Password change
     - Logout option

3. **Site Selector**
   - ID: dealername
   - Current: "Capital Chrysler Dodge Jeep Ram (5431)"
   - Alternative: "AutoCanada (4156)"
   - Features: Live search functionality

4. **Website Link**
   - ID: globe_website_link
   - Target: http://www.capitaljeep.com
   - Tooltip: Website preview

## Navigation CSS Classes

### Key Classes:
- 	opnav - Main horizontal navigation
- 
avbar-default sidebar - Left sidebar container
- 
av nav-second-level - Second level menu items
- 
av nav-third-level - Third level menu items
- ctive open - Currently selected/expanded items
- collapse / collapse in - Collapsible menu states
- d2c_navbar_style - Custom D2C styling

### Responsive Classes:
- hidden-xs - Hidden on extra small screens
- hidden-sm - Hidden on small screens
- pull-right - Right-aligned elements
- mobilemenu-trigger - Mobile menu activation

## JavaScript Navigation Controls

### Menu Toggle Functions:
- Menu_Hide_SideMenu - Sidebar collapse/expand
- d2cmedia.changeLanguage() - Language switching
- 
eedHelpContactForm() - Help system activation

### Data Attributes:
- data-islink="true/false" - Indicates if item is a direct link
- data-controller - Controller name for routing
- data-action - Action name for routing
- data-siteid - Site identifier for multi-site features

---

*This documentation covers all navigation structures found in the D2C platform HTML files.*
