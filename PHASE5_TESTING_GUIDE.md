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

