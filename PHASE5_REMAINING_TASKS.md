# Phase 5: Engagement - Remaining Tasks

## Current Status

### ✅ Completed Features

#### Event Management (4/6 tasks - 67%)
- ✅ Create event creation system - **DONE**
  - Backend: `eventService.ts`, `eventController.ts`, `event.ts` routes
  - Frontend: `EventsPage.tsx` with create event modal
  - Full CRUD operations (Create, Read, Update, Delete)
  
- ✅ Implement event registration - **DONE**
  - Registration/cancellation endpoints
  - User registration tracking
  - Max attendees management
  
- ✅ Add event calendar - **DONE**
  - Event listing page
  - Search functionality
  - Date/time display
  
- ✅ Create event notifications - **DONE**
  - Notifications sent when events are created
  - Registration notifications

#### Notification System (1/5 tasks - 20%)
- ✅ Add in-app notifications - **DONE**
  - Backend: `notificationService.ts`, `notificationController.ts`
  - Frontend: Notification badge in Header
  - Real-time updates (30-second polling)
  - Mark as read functionality

---

## ❌ Remaining Tasks

### 5.1 Event Management - Missing Features

#### 1. Implement Event Feedback (Backend + Frontend)

**Backend Requirements:**
- Add endpoint to submit event feedback
  - Route: `POST /api/events/:id/feedback`
  - Fields: rating (1-5), feedback text, optional attendance confirmation
  - Update `event_registrations` table with feedback data
  
- Add endpoint to get event feedback
  - Route: `GET /api/events/:id/feedback`
  - For organizers: see all feedback for their events
  - For attendees: see/update their own feedback
  
- Add endpoint to get event statistics
  - Average rating
  - Total feedback count
  - Rating distribution

**Frontend Requirements:**
- Create `EventFeedbackModal.tsx` component
  - Rating stars (1-5)
  - Feedback textarea
  - Submit button
  - Show after event end date
  - Trigger when viewing past registered events
  
- Update `EventsPage.tsx`
  - Add "Give Feedback" button on past events user attended
  - Display average rating on event cards
  - Show feedback stats for organizers
  
- Create feedback display component
  - Show feedback list for organizers
  - Display average rating prominently

**Database Changes Needed:**
```sql
-- Already exists in event_registrations table:
-- feedback TEXT
-- rating INT CHECK (rating >= 1 AND rating <= 5)
-- attendance_status ENUM('registered', 'attended', 'no_show')
```

#### 2. Add Event Analytics (Backend + Frontend)

**Backend Requirements:**
- Create analytics service (`eventAnalyticsService.ts`)
  - Get event statistics:
    - Total events created
    - Total registrations
    - Registration rate (registrations/events)
    - Average attendance rate
    - Most popular event types
    - Most active organizers
    - Events by status (upcoming, past, cancelled)
    - Revenue from paid events
    - Registration trends over time
    
- Add analytics endpoints
  - Route: `GET /api/events/analytics` (for admins)
  - Route: `GET /api/events/organizer/analytics` (for organizers)
  
- Add event-specific analytics
  - Route: `GET /api/events/:id/analytics`
  - Registration count
  - Attendance rate
  - Average rating
  - Revenue (for paid events)
  - Registration timeline

**Frontend Requirements:**
- Create `EventAnalyticsPage.tsx` component
  - Dashboard with charts and metrics
  - For admins: overall platform analytics
  - For organizers: their events analytics
  - Components:
    - Total events card
    - Total registrations card
    - Registration rate chart
    - Popular event types chart
    - Revenue chart (if applicable)
    - Registration timeline chart
    
- Add route: `/events/analytics` (admin/organizer only)
- Add "View Analytics" button in organizer's event list

**Charts Library Needed:**
- Install: `recharts` or `chart.js` with `react-chartjs-2`

---

### 5.2 Notification System - Missing Features

#### 3. Create Notification Preferences (Backend + Frontend)

**Backend Requirements:**
- Create `notification_preferences` table
```sql
CREATE TABLE notification_preferences (
    id INT PRIMARY KEY AUTO_INCREMENT,
    user_id INT NOT NULL UNIQUE,
    email_enabled BOOLEAN DEFAULT TRUE,
    push_enabled BOOLEAN DEFAULT TRUE,
    in_app_enabled BOOLEAN DEFAULT TRUE,
    
    -- Category preferences
    job_notifications BOOLEAN DEFAULT TRUE,
    application_notifications BOOLEAN DEFAULT TRUE,
    event_notifications BOOLEAN DEFAULT TRUE,
    system_notifications BOOLEAN DEFAULT TRUE,
    message_notifications BOOLEAN DEFAULT TRUE,
    
    -- Type preferences
    info_notifications BOOLEAN DEFAULT TRUE,
    success_notifications BOOLEAN DEFAULT TRUE,
    warning_notifications BOOLEAN DEFAULT TRUE,
    error_notifications BOOLEAN DEFAULT TRUE,
    
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);
```

- Create `notificationPreferencesService.ts`
  - Get user preferences: `getUserPreferences(userId)`
  - Update preferences: `updatePreferences(userId, preferences)`
  - Create default preferences: `createDefaultPreferences(userId)`
  - Check if notification should be sent: `shouldSendNotification(userId, notificationType, category)`

- Update `notificationService.ts`
  - Check preferences before creating notifications
  - Only send notifications based on user preferences
  
- Add endpoints
  - Route: `GET /api/notifications/preferences`
  - Route: `PUT /api/notifications/preferences`

**Frontend Requirements:**
- Create `NotificationPreferencesPage.tsx` or modal
  - Toggle switches for each preference
  - Grouped by:
    - Delivery method (email, push, in-app)
    - Category (job, application, event, system, message)
    - Type (info, success, warning, error)
  - Save button
  - Reset to defaults button

- Add link to user settings/profile page
- Update notification service to respect preferences

#### 4. Implement Notification Scheduling (Backend + Frontend)

**Backend Requirements:**
- Create `scheduled_notifications` table
```sql
CREATE TABLE scheduled_notifications (
    id INT PRIMARY KEY AUTO_INCREMENT,
    user_id INT NOT NULL,
    title VARCHAR(255) NOT NULL,
    message TEXT NOT NULL,
    type ENUM('info', 'success', 'warning', 'error') DEFAULT 'info',
    category ENUM('job', 'application', 'event', 'system', 'message') DEFAULT 'system',
    scheduled_at TIMESTAMP NOT NULL,
    is_sent BOOLEAN DEFAULT FALSE,
    sent_at TIMESTAMP NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    INDEX idx_user (user_id),
    INDEX idx_scheduled_at (scheduled_at),
    INDEX idx_sent (is_sent)
);
```

- Create `notificationSchedulerService.ts`
  - Schedule notification: `scheduleNotification(data)`
  - Get pending notifications: `getPendingNotifications()`
  - Send scheduled notifications: `processScheduledNotifications()`
  - Use cron job or scheduled task to process
  
- Add endpoints
  - Route: `POST /api/notifications/schedule`
  - Route: `GET /api/notifications/scheduled`
  - Route: `DELETE /api/notifications/scheduled/:id`

**Frontend Requirements:**
- Create `ScheduleNotificationModal.tsx`
  - Title and message inputs
  - Type and category selectors
  - Date/time picker for scheduling
  - Preview scheduled notification
  - List of scheduled notifications
  - Cancel scheduled notification option

- Add to admin/employer dashboard (for sending scheduled announcements)

**Backend Cron Job:**
- Set up periodic task (every minute) to check and send scheduled notifications
- Use `node-cron` or similar library

#### 5. Add Notification Analytics (Backend + Frontend)

**Backend Requirements:**
- Create analytics endpoints
  - Route: `GET /api/notifications/analytics` (admin only)
  - Metrics:
    - Total notifications sent
    - Read rate (read/total)
    - Unread rate
    - Notifications by category
    - Notifications by type
    - Notification trends over time
    - Average time to read
    - Most engaged users
    - Notification delivery method stats

- Update `notificationService.ts`
  - Track notification sent time
  - Track read time (already tracked)
  - Calculate time to read

**Frontend Requirements:**
- Create `NotificationAnalyticsPage.tsx`
  - Dashboard with charts:
    - Total notifications sent
    - Read/unread rate pie chart
    - Notifications by category bar chart
    - Notifications by type bar chart
    - Notification trends over time line chart
    - Average read time metric
  - Add to admin dashboard

#### 6. Create Notification Templates (Backend + Frontend)

**Backend Requirements:**
- Create `notification_templates` table
```sql
CREATE TABLE notification_templates (
    id INT PRIMARY KEY AUTO_INCREMENT,
    name VARCHAR(255) NOT NULL,
    title_template VARCHAR(255) NOT NULL,
    message_template TEXT NOT NULL,
    type ENUM('info', 'success', 'warning', 'error') DEFAULT 'info',
    category ENUM('job', 'application', 'event', 'system', 'message') DEFAULT 'system',
    variables TEXT, -- JSON array of available variables
    created_by INT, -- Admin user ID
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    FOREIGN KEY (created_by) REFERENCES users(id) ON DELETE SET NULL
);
```

- Create `notificationTemplateService.ts`
  - CRUD operations for templates
  - Get template: `getTemplate(templateId)`
  - Render template: `renderTemplate(templateId, variables)`
  - Variable substitution (e.g., `{{user_name}}`, `{{job_title}}`)
  
- Add endpoints
  - Route: `GET /api/notifications/templates`
  - Route: `GET /api/notifications/templates/:id`
  - Route: `POST /api/notifications/templates` (admin only)
  - Route: `PUT /api/notifications/templates/:id` (admin only)
  - Route: `DELETE /api/notifications/templates/:id` (admin only)
  - Route: `POST /api/notifications/templates/:id/send` (use template to send notification)

**Frontend Requirements:**
- Create `NotificationTemplatesPage.tsx` (admin only)
  - List of templates
  - Create new template modal
  - Edit template
  - Delete template
  - Preview template with sample data
  - Use template to send notification
  
- Add route: `/admin/notifications/templates`
- Template editor with variable hints
- Template preview section

---

## Implementation Priority

### High Priority
1. **Event Feedback** - Critical for event quality assessment
2. **Event Analytics** - Important for organizers to track event performance
3. **Notification Preferences** - Essential for user experience

### Medium Priority
4. **Notification Scheduling** - Useful for announcements
5. **Notification Analytics** - Important for admin insights

### Low Priority
6. **Notification Templates** - Nice to have for standardized messages

---

## Database Migrations Needed

1. `create_notification_preferences.sql`
2. `create_scheduled_notifications.sql`
3. `create_notification_templates.sql`
4. No new tables needed for event feedback (already exists in `event_registrations`)

---

## Estimated Implementation Time

- Event Feedback: 2-3 days
- Event Analytics: 2-3 days
- Notification Preferences: 2 days
- Notification Scheduling: 2-3 days
- Notification Analytics: 1-2 days
- Notification Templates: 2-3 days

**Total: ~11-16 days**

---

## File Structure to Create

### Backend
```
backend/src/
├── services/
│   ├── eventAnalyticsService.ts
│   ├── notificationPreferencesService.ts
│   ├── notificationSchedulerService.ts
│   └── notificationTemplateService.ts
├── controllers/
│   ├── eventAnalyticsController.ts
│   ├── notificationPreferencesController.ts
│   ├── notificationSchedulerController.ts
│   └── notificationTemplateController.ts
└── routes/
    ├── eventAnalytics.ts (or add to event.ts)
    ├── notificationPreferences.ts (or add to notification.ts)
    ├── notificationScheduler.ts (or add to notification.ts)
    └── notificationTemplates.ts (or add to notification.ts)
```

### Frontend
```
frontend/src/
├── components/
│   ├── events/
│   │   ├── EventFeedbackModal.tsx
│   │   └── EventAnalyticsPage.tsx
│   └── notifications/
│       ├── NotificationPreferencesPage.tsx
│       ├── ScheduleNotificationModal.tsx
│       ├── NotificationAnalyticsPage.tsx
│       └── NotificationTemplatesPage.tsx
└── services/
    ├── eventAnalyticsService.ts
    ├── notificationPreferencesService.ts
    ├── notificationSchedulerService.ts
    └── notificationTemplateService.ts
```

