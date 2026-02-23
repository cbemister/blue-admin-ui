# D2C Platform - Form Elements and Controls

## Form System Overview

The D2C platform uses a sophisticated form system with custom attributes for data management and validation. All form elements use specific attributes to integrate with the platform's save/load functionality.

## Core Form Attributes

### Essential Attributes
- **savefield** - The database field name that stores the value
- **savetype** - The type of data being saved (text, check, file, area, select)
- **d2c_language** - Language variant (ENGLISH, FRENCH, INDEPENDENT)
- **defaultvalue** - The default value for the field
- **originalvalue** - The original value when the form was loaded
- **
ame** - Standard HTML name attribute (usually matches ID)
- **id** - Unique identifier for the element

### Language Support
The platform supports three language contexts:
- **ENGLISH** - English-specific content
- **FRENCH** - French-specific content  
- **INDEPENDENT** - Language-neutral settings

## Form Element Types

### 1. Text Input Fields
**Purpose**: Single-line text entry for names, URLs, phone numbers, etc.

**Structure**:
`html
<input savefield="FIELD_NAME" 
       id="FIELD_NAME_LANGUAGE" 
       value="current_value"
       d2c_language="LANGUAGE" 
       defaultvalue="default_value" 
       name="FIELD_NAME_LANGUAGE" 
       originalvalue="original_value" 
       savetype="text" 
       type="text">
`

**Examples**:
- Dealer name color settings
- Privacy policy contact information
- Phone numbers and email addresses
- URL redirection fields

### 2. Checkbox Controls
**Purpose**: Boolean settings and feature toggles

**Structure**:
`html
<input savefield="FEATURE_CHECK" 
       id="FEATURE_CHECK_INDEPENDENT" 
       value="true/false"
       checked="checked" (if true)
       d2c_language="INDEPENDENT" 
       defaultvalue="true/false" 
       name="FEATURE_CHECK_INDEPENDENT" 
       originalvalue="true/false" 
       savetype="check" 
       type="checkbox">
`

**Common Checkboxes**:
- ALLOW_D2C_TEST_CHECK - Allow D2C testing features
- GOOGLE_TRANSLATE_CHECK - Enable Google Translate
- RESPONSIVE_EDITOR_ENABLED - Enable responsive HTML editor
- ALLOW_DEALER_UPLOAD_BANNERS - Allow banner uploads
- HIDE_OEM_MAKE_CHECK - Hide OEM make names
- ADMIN_GENERAL_USERESPONSIVESITE_CHECK - Use responsive site

### 3. Color Picker Fields
**Purpose**: Color selection for styling elements

**Structure**:
`html
<input savefield="COLOR_FIELD" 
       id="COLOR_FIELD_LANGUAGE" 
       class="colpick" 
       value="#hexcolor"
       style="width: 55px; border-radius: 3px 0px 0px 3px; vertical-align: middle; display: inline-block;"
       d2c_language="LANGUAGE" 
       defaultvalue="#hexcolor" 
       name="COLOR_FIELD_LANGUAGE" 
       originalvalue="#hexcolor" 
       savetype="text" 
       type="text">
`

**Color Fields Include**:
- Header service appointment colors (background/text)
- Cookie consent button colors
- General UI element colors
- Dealer name display colors

### 4. File Upload Controls
**Purpose**: Image and document uploads

**Structure**:
`html
<form id="FIELD_LANGUAGE_form" 
      name="FIELD_LANGUAGE_form" 
      action="/ajax/genMultiUpload" 
      method="POST" 
      enctype="multipart/form-data">
    <input savefield="FIELD_NAME" 
           id="FIELD_LANGUAGE_file" 
           accept="image/*"
           d2c_language="LANGUAGE" 
           forfield="FIELD_NAME" 
           name="FIELD_LANGUAGE_file" 
           onchange="fileupload_redirect(event);" 
           savetype="file" 
           type="file">
    <input type="hidden" name="fieldName" value="FIELD_NAME">
    <input type="hidden" name="siteid" value="2379">
</form>
`

**File Upload Types**:
- Logo uploads (main, mobile, footer)
- Special hours content images
- Popup images and banners
- Favicon uploads
- Multi-location images

### 5. Textarea Fields (Rich Text)
**Purpose**: Multi-line text content with HTML support

**Structure**:
`html
<textarea savefield="CONTENT_FIELD" 
          id="CONTENT_FIELD_LANGUAGE" 
          style="width:300px; height:300px;"
          d2c_language="LANGUAGE" 
          data-isresponsive="1"
          richtext="1"
          savetype="area" 
          usearea="1"
          name="CONTENT_FIELD_LANGUAGE"
          onchange="this.setAttribute('dirty','true');">
    Content here
</textarea>
`

**Rich Text Areas**:
- Terms and conditions text
- Privacy policy content
- SMS auto-response messages
- Legal text and disclaimers

### 6. Select Dropdowns
**Purpose**: Single-choice selection from predefined options

**Structure**:
`html
<select savefield="DROPDOWN_FIELD" 
        id="DROPDOWN_FIELD_LANGUAGE" 
        d2c_language="LANGUAGE" 
        defaultvalue="default_option" 
        name="DROPDOWN_FIELD_LANGUAGE" 
        originalvalue="current_option" 
        savetype="select">
    <option value="option1">Option 1</option>
    <option value="option2">Option 2</option>
</select>
`

**Examples**:
- Privacy policy template selection
- Language selection dropdowns
- Configuration option selectors

### 7. Multi-Select Controls
**Purpose**: Multiple choice selections

**Structure**:
`html
<select id="multiSelectField" 
        name="multiSelectField" 
        multiple="multiple" 
        forfield="RELATED_FIELD">
    <option value="value1">Option 1</option>
    <option value="value2">Option 2</option>
</select>
`

**Examples**:
- Google Translate language selection
- Feature selection lists

## Form Containers and Organization

### Form Groups
Forms are organized using Bootstrap form-group classes:
`html
<div class="form-group">
    <label for="field_id">Label Text</label>
    <!-- Form element here -->
</div>
`

### Language Tables
Bilingual content is organized in table structures:
`html
<table>
    <tr>
        <td>French Content</td>
        <td>English Content</td>
    </tr>
</table>
`

### Expandable Sections
Content is organized in collapsible sections:
`html
<h5 class="expandablesection open" 
    expandablecontainer="container_id" 
    expandablestatus="open">
    Section Title
</h5>
`

## Form Validation and States

### Field States
- **dirty="true/false"** - Indicates if field has been modified
- **disabled="disabled"** - Field is not editable
- **eadonly="readonly"** - Field is visible but not editable

### Validation Attributes
- **
ovalidate="novalidate"** - Disables HTML5 validation
- **equired** - Field is mandatory
- **ccept="image/*"** - File type restrictions

## Button Controls

### File Upload Buttons
`html
<label id="FIELD_LANGUAGE_button" 
       class="filebuttonX buttonSmall" 
       afteruploadtext="Modify">
    <span id="FIELD_LANGUAGE_buttontext">Add/Modify</span>
</label>
`

### Action Buttons
- **Add** - For new file uploads
- **Modify** - For existing file changes
- **Erase** - For removing content
- **Save** - For form submission

## Special Form Features

### Tooltip Integration
Many fields include tooltip functionality:
- **ddtooltip="1"** - Enables tooltip
- **	ooltipcurrentsrc** - Current image source for tooltips

### File Management
File uploads include additional metadata:
- **ilename** - Original filename
- **ullpath** - Complete file path
- **uri** - File URI for display

### Color Picker Integration
Color fields use Spectrum color picker:
- **class="colpick"** - Enables color picker
- Automatic preview generation
- Hex color validation

## Form Submission and AJAX

### Save Mechanism
The platform uses AJAX for form submission:
- Individual field saving
- Batch form processing
- Real-time validation
- Auto-save functionality

### File Upload Process
File uploads use dedicated endpoints:
- **/ajax/genMultiUpload** - Main upload handler
- **ileupload_redirect(event)** - Upload processing
- Automatic thumbnail generation
- File validation and processing

## Common Form Patterns

### Bilingual Content Pattern
`html
<td>
    <form class="form_type" novalidate="novalidate">
        <input savefield="FIELD" id="FIELD_FRENCH" d2c_language="FRENCH" ...>
    </form>
</td>
<td>
    <form class="form_type" novalidate="novalidate">
        <input savefield="FIELD" id="FIELD_ENGLISH" d2c_language="ENGLISH" ...>
    </form>
</td>
`

### Color Configuration Pattern
`html
<div class="form-group">
    <label>Background Color</label>
    <input class="colpick" savefield="BG_COLOR" ...>
</div>
<div class="form-group">
    <label>Text Color</label>
    <input class="colpick" savefield="TEXT_COLOR" ...>
</div>
`

### File Upload with Preview Pattern
`html
<label class="filebuttonX buttonSmall" tooltipcurrentsrc="/path/to/image">
    <span>Modify</span>
    <form action="/ajax/genMultiUpload" method="POST" enctype="multipart/form-data">
        <input type="file" accept="image/*" ...>
        <input type="hidden" name="siteid" value="2379">
    </form>
</label>
`

## Form CSS Classes

### Key Classes
- **orm-group** - Bootstrap form grouping
- **ilebuttonX** - Custom file upload button
- **uttonSmall** - Small button styling
- **colpick** - Color picker activation
- **disabled** - Disabled state styling

### Responsive Classes
- **hidden-xs** - Hidden on extra small screens
- **pull-right** - Right-aligned elements
- **ottom15** - Bottom margin spacing

---

*This documentation covers the comprehensive form system used throughout the D2C platform for content management and configuration.*
