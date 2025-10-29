# Phase 5 Testing Guide

## Prerequisites
✅ Backend is running on http://localhost:3001  
✅ Frontend is running on http://localhost:3000

## Test Accounts

### Student Account
- **Email:** `student@university.edu`
- **Password:** `password123`
- **Role:** Student

### Employer Account  
- **Email:** `employer@techcorp.com`
- **Password:** `password123`
- **Role:** Employer

### Admin Account
- **Email:** `admin@careerdev.com`
- **Password:** `password123`
- **Role:** Admin

---

## Test 1: View Events as Student

### Steps:
1. Open browser: http://localhost:3000
2. Click "Sign In" button
3. Login with student credentials
4. Click "Events" link in the header navigation
5. You should see:
   - "Events" page title
   - List of available events (2 events pre-seeded)
   - Each event card showing:
     - Event title
     - Event type badge (workshop/networking/webinar/etc.)
     - Date and time
     - Location and location type
     - Number of attendees
     - Free/Paid status
     - "Register" button
6. Use the search box to filter events

### Expected Results:
- ✅ Events page loads successfully
- ✅ All events are displayed
- ✅ Search functionality works
- ✅ Register button appears for unregistered events

---

## Test 2: Register for Event as Student

### Steps:
1. On Events page, click "Register" button on any event
2. The button should change to "Cancel" with a checkmark icon
3. A "Registered" badge should appear on the event card
4. Click "Cancel" to unregister

### Expected Results:
- ✅ Registration works without errors
- ✅ Button state updates correctly
- ✅ "Registered" badge appears
- ✅ Cancellation works correctly

---

## Test 3: Create Event as Employer/Admin

### Steps:
1. Logout from student account
2. Login as employer: `employer@techcorp.com` / `password123`
3. Navigate to Events page
4. Click "Create Event" button
5. Fill in the form:
   - **Event Title:** "React Workshop"
   - **Description:** "Learn React fundamentals"
   - **Event Type:** Workshop
   - **Location Type:** Online
   - **Location:** "Zoom Meeting"
   - **Start Date & Time:** Set to a future date
   - **End Date & Time:** Set 2 hours later
   - **Max Attendees:** 50
   - **Free Event:** Checked
6. Click "Create Event"

### Expected Results:
- ✅ Modal opens correctly
- ✅ Form validation works
- ✅ Event is created successfully
- ✅ New event appears in the list
- ✅ Modal closes after creation

---

## Test 4: Notification Badge

### Steps:
1. While logged in as any user
2. Look at the header navigation
3. Find the bell icon (notification icon)
4. Click on the bell icon
5. A dropdown should appear showing notifications (if any)

### Expected Results:
- ✅ Bell icon is visible in header
- ✅ Dropdown opens on click
- ✅ Shows "No notifications" if none exist
- ✅ Unread count badge appears if notifications exist
- ✅ Clicking outside closes the dropdown
- ✅ Notifications refresh every 30 seconds

---

## Test 5: My Events as Employer

### Steps:
1. As employer, after creating events
2. Look for the events you created
3. You should see your events listed
4. Each event shows:
   - Attendee count
   - Registration status
   - Event details

### Expected Results:
- ✅ Employer sees their created events
- ✅ Event details are correct
- ✅ Attendee information is displayed

---

## API Testing (Optional)

### Test Events API:
```bash
# Get all events
curl http://localhost:3001/api/events

# Get event by ID
curl http://localhost:3001/api/events/1

# Get user's registrations (requires auth token)
curl -H "Authorization: Bearer YOUR_TOKEN" http://localhost:3001/api/events/user/my-registrations
```

### Test Notifications API:
```bash
# Get notifications (requires auth token)
curl -H "Authorization: Bearer YOUR_TOKEN" http://localhost:3001/api/notifications

# Get unread count (requires auth token)
curl -H "Authorization: Bearer YOUR_TOKEN" http://localhost:3001/api/notifications/unread-count
```

---

## Current Database Events

The system currently has 2 pre-seeded events:

1. **Career Development Workshop**
   - Type: Workshop
   - Location: In-person
   - Date: January 20, 2025
   - Location: University Campus

2. **Tech Industry Networking Event**
   - Type: Networking
   - Location: Online
   - Date: January 25, 2025
   - Location: Virtual Event

---

## Test 6: Event Feedback (NEW)

### Steps:
1. Login as student: `student@university.edu` / `password123`
2. Navigate to Events page
3. Register for an event that has already ended (past event)
4. After event end date, you should see "Give Feedback" button instead of "Cancel"
5. Click "Give Feedback" button
6. Fill in the feedback modal:
   - **Rating:** Select 1-5 stars
   - **Attendance Status:** Select "Attended" or "Did Not Attend"
   - **Your Feedback:** Enter text feedback
7. Click "Submit Feedback"
8. Try submitting feedback for an event that hasn't ended yet - should show error

### Expected Results:
- ✅ "Give Feedback" button appears for past registered events
- ✅ Feedback modal opens correctly
- ✅ Star rating system works (hover and click)
- ✅ Can select attendance status
- ✅ Text feedback is required
- ✅ Submission works successfully
- ✅ Error shown if event hasn't ended
- ✅ Cannot submit feedback if not registered

---

## Test 7: Event Analytics (NEW)

### Steps (as Employer/Admin):
1. Login as employer: `employer@techcorp.com` / `password123`
2. Click "Event Analytics" in the header navigation
3. You should see analytics dashboard with:
   - **Key Metrics Cards:**
     - Total Events
     - Total Registrations
     - Attendance Rate
     - Total Revenue
   - **Events by Type** (chart/list)
   - **Events by Status** (Upcoming/Past/Cancelled)
   - **Top Events by Registrations** (list with ratings)
   - **Registration Trends** (last 30 days with progress bars)

### Steps (as Admin - Overall Analytics):
1. Login as admin: `admin@careerdev.com` / `password123`
2. Navigate to Event Analytics
3. Should see overall platform analytics (not just your events)

### Expected Results:
- ✅ Analytics page loads successfully
- ✅ All metrics are displayed correctly
- ✅ Charts/data visualizations render
- ✅ Top events show with ratings
- ✅ Registration trends show progress bars
- ✅ Organizer sees only their events
- ✅ Admin sees all platform events

---

## Test 8: Notification Preferences (NEW)

### Steps:
1. Login as any user
2. Click the bell icon (notifications) in header
3. Click "Notification Settings →" link in the dropdown
4. OR navigate directly to: `/settings/notifications`
5. You should see three sections:
   
   **Delivery Methods:**
   - Email Notifications (toggle)
   - Push Notifications (toggle - disabled for now)
   - In-App Notifications (toggle)
   
   **Notification Categories:**
   - Job Notifications
   - Application Updates
   - Event Notifications
   - System Notifications
   - Messages
   
   **Notification Types:**
   - Info Notifications
   - Success Notifications
   - Warning Notifications
   - Error Notifications

6. Toggle some preferences (turn off a few categories/types)
7. Click "Save Preferences"
8. Test notification behavior:
   - Disable "Event Notifications"
   - Register for an event
   - Should NOT receive event notification
   - Re-enable "Event Notifications"
   - Register for another event
   - Should receive notification

### Expected Results:
- ✅ Preferences page loads correctly
- ✅ All toggles work smoothly
- ✅ Can enable/disable any preference
- ✅ Save button works
- ✅ Success message appears after saving
- ✅ Preferences persist after page refresh
- ✅ Notifications respect preferences (disabled notifications don't appear)
- ✅ Reset button reloads original preferences

---

## Testing Checklist

### Event Management
- [ ] View all events
- [ ] Search events
- [ ] Register for event
- [ ] Cancel registration
- [ ] Create new event (employer/admin)
- [ ] Event details display correctly
- [ ] Responsive design works on mobile

### Notification System  
- [ ] Notification bell icon appears
- [ ] Unread count badge shows
- [ ] Dropdown opens and closes
- [ ] Mark as read works
- [ ] Mark all as read works
- [ ] Auto-refresh works
- [ ] Click outside to close

### Role-Based Access
- [ ] Student can view and register
- [ ] Student cannot create events
- [ ] Employer can create events
- [ ] Admin can create events
- [ ] All roles can see notifications

### Event Feedback (Phase 5.1)
- [ ] "Give Feedback" button appears for past events
- [ ] Feedback modal opens correctly
- [ ] Star rating system works (1-5 stars)
- [ ] Attendance status selection works
- [ ] Text feedback is required
- [ ] Can submit feedback successfully
- [ ] Cannot submit feedback before event ends
- [ ] Cannot submit feedback if not registered

### Event Analytics (Phase 5.1)
- [ ] Analytics page accessible to employer/admin
- [ ] Key metrics display correctly (Events, Registrations, Attendance Rate, Revenue)
- [ ] Events by type chart/list shows data
- [ ] Events by status shows correct counts
- [ ] Top events list shows registrations and ratings
- [ ] Registration trends show last 30 days
- [ ] Organizer sees only their events
- [ ] Admin sees overall platform analytics

### Notification Preferences (Phase 5.2)
- [ ] Preferences page accessible from notification dropdown
- [ ] Delivery methods toggles work (Email, Push, In-App)
- [ ] Category preferences work (Job, Application, Event, System, Message)
- [ ] Type preferences work (Info, Success, Warning, Error)
- [ ] Save button saves preferences
- [ ] Success message appears after saving
- [ ] Preferences persist after refresh
- [ ] Disabled notifications don't appear
- [ ] Reset button works

---

## Troubleshooting

### If events don't load:
- Check backend console for errors
- Verify database connection
- Check API endpoints in Network tab

### If notifications don't show:
- Check if user is authenticated
- Verify notification service is working
- Check browser console for errors

### If Create Event button doesn't work:
- Verify user role is employer or admin
- Check form validation
- Ensure all required fields are filled

---

## Success Criteria

✅ All event CRUD operations work  
✅ Event registration/cancellation works  
✅ Notification badge and dropdown work  
✅ Role-based access control works  
✅ Responsive design works  
✅ Search functionality works  
✅ No console errors  

---

Happy Testing! 🎉

