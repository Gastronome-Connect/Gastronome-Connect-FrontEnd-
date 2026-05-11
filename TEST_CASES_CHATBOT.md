# TEST CASES - AI CHATBOT FEATURE

## Overview
This document covers comprehensive test cases for the AI Chatbot (Gastro AI) feature in Gastronome Connect. The chatbot provides recipe suggestions, cooking help, and food-related information through an interactive chat interface.

---

## Test Case 1: Chatbot Widget Initialization

**Test Case ID:** CHAT_001  
**Feature:** Chatbot Widget Display  
**Component:** ChatbotWidget.jsx  
**Priority:** High  
**Severity:** Critical

### Preconditions
- User is on Feed page or any main page with chatbot widget
- Chatbot widget is loaded in the page
- User is logged in (optional)

### Test Steps
1. Navigate to Feed page
2. Observe chatbot widget in bottom-right area
3. Verify widget header is visible
4. Check for AI logo and title
5. Verify collapse/expand button is present

### Expected Results
- Chatbot widget appears in bottom-right corner
- Widget displays:
  - AI Logo (AILogo.png)
  - Title: "Gastro AI" or similar
  - Subtitle: "Ask me anything about food & recipes"
  - Collapse/expand chevron button
- Widget is initially in COLLAPSED state
- No messages visible
- Widget is non-intrusive (doesn't block main content)

### Postconditions
- Widget is ready for user interaction
- User can click to expand
- Messages panel is empty

### Pass/Fail Criteria
- ✅ PASS: Widget visible, properly styled, collapse/expand button functional
- ❌ FAIL: Widget not visible, missing elements, or styling broken

---

## Test Case 2: Open Chatbot Widget

**Test Case ID:** CHAT_002  
**Feature:** Chatbot Expansion  
**Component:** ChatbotWidget.jsx, motion animations  
**Priority:** High  
**Severity:** High

### Preconditions
- Chatbot widget is visible on page
- Widget is in collapsed state
- User is ready to interact

### Test Steps
1. Click on chatbot widget header
2. Observe animation
3. Wait for expansion to complete
4. Verify expanded state

### Expected Results
- Widget expands smoothly with animation
- Animation duration: ~300ms
- Expanded view displays:
  - Close/collapse button (X or chevron)
  - Message display area (empty initially)
  - Message input field (textarea)
  - "Send" button
  - Pre-written suggestions
- Widget now shows full chat interface
- Message history is empty

### Postconditions
- Widget is expanded and ready for input
- Input field is focused (optional)
- User can see suggestion buttons

### Test Data
```
Initial state: collapsed
Expected final state: expanded
Animation: smooth framer-motion
```

### Pass/Fail Criteria
- ✅ PASS: Widget expands smoothly, all UI elements visible
- ❌ FAIL: Animation glitchy, elements missing, or expansion fails

---

## Test Case 3: View Pre-written Suggestions

**Test Case ID:** CHAT_003  
**Feature:** Chatbot Suggestions  
**Component:** ChatbotWidget.jsx, SUGGESTIONS array  
**Priority:** Medium  
**Severity:** Medium

### Preconditions
- Chatbot widget is expanded
- No messages have been sent yet
- Suggestions are configured in frontend

### Test Steps
1. Open chatbot widget
2. Observe suggestion buttons at bottom
3. Count visible suggestions
4. Click each suggestion to verify text

### Expected Results
- 3 pre-written suggestions are displayed:
  1. "Tell me something interesting"
  2. "What can I cook with chicken?"
  3. "Help me plan a quick dinner"
- Suggestions are clickable buttons
- Suggestions are highlighted/styled distinctly
- Each suggestion is readable and clear

### Postconditions
- User can click on suggestions to send them
- Suggestions are replaced with user message history after first message

### Test Data
```
Expected suggestions:
1. "Tell me something interesting"
2. "What can I cook with chicken?"
3. "Help me plan a quick dinner"
```

### Pass/Fail Criteria
- ✅ PASS: All 3 suggestions visible, clickable, correct text
- ❌ FAIL: Missing suggestions, wrong text, or not clickable

---

## Test Case 4: Send Message via Suggestion Click

**Test Case ID:** CHAT_004  
**Feature:** Message Submission via Suggestion  
**Component:** ChatbotWidget.jsx, sendMessage function  
**Priority:** High  
**Severity:** High

### Preconditions
- Chatbot widget is expanded
- Suggestions are visible
- Network is stable

### Test Steps
1. Click on suggestion: "What can I cook with chicken?"
2. Observe message submission
3. Wait for bot response (up to 10 seconds)
4. Observe message in chat history

### Expected Results
- User message appears in chat with:
  - Timestamp (formatted as HH:MM)
  - Message text: "What can I cook with chicken?"
  - User message styling (right-aligned, blue bubble)
- Message is added to messages state
- API call to `/api/chatbot/message` is made with:
  ```json
  {
    "message": "What can I cook with chicken?",
    "history": [...previous messages...]
  }
  ```
- Loading indicator appears (bot typing state)
- Bot response appears with:
  - Timestamp
  - AI message styling (left-aligned, gray bubble)
  - Response text (e.g., recipe suggestions)
- Suggestions are replaced with actual message history

### Postconditions
- Both messages visible in chat history
- User can send another message
- Input field is cleared and ready
- Chat scrolls to show latest message

### Test Data
```
Input: "What can I cook with chicken?"
Expected Output: Bot response with recipe suggestions
Response Time: 2-5 seconds
```

### Pass/Fail Criteria
- ✅ PASS: Message sent, bot responds with relevant suggestions
- ❌ FAIL: Message not sent, bot doesn't respond, or error shown

---

## Test Case 5: Send Custom Message via Input

**Test Case ID:** CHAT_005  
**Feature:** Custom Message Input  
**Component:** ChatbotWidget.jsx, ChatInput.jsx  
**Priority:** High  
**Severity:** High

### Preconditions
- Chatbot widget is expanded
- User wants to send custom message
- Network is stable

### Test Steps
1. Click in message input field
2. Type custom message: "I have salmon, rice, and lemon. What can I make?"
3. Observe input field as you type
4. Click "Send" button (or press Shift+Enter)
5. Wait for bot response

### Expected Results
- Text appears in input field as typed
- Input field auto-expands height if text wraps
- Max height with scrollbar after ~4 lines
- "Send" button is enabled (not greyed out)
- Click "Send" sends the message
- User message appears in chat immediately
- Input field is cleared
- Loading indicator shows bot is thinking
- Bot response appears after 2-10 seconds

### Postconditions
- Chat history updated with both messages
- User can send another message
- Cursor in input field ready for next message

### Test Data
```
Input: "I have salmon, rice, and lemon. What can I make?"
Expected output: Recipe suggestions with salmon as main ingredient
```

### Pass/Fail Criteria
- ✅ PASS: Message sent, bot responds with relevant recipe
- ❌ FAIL: Send fails, bot doesn't respond, or message lost

---

## Test Case 6: Send Message via Enter Key

**Test Case ID:** CHAT_006  
**Feature:** Keyboard Submission  
**Component:** ChatbotWidget.jsx, handleKeyDown  
**Priority:** Medium  
**Severity:** Medium

### Preconditions
- Chatbot widget is expanded
- Message input field is focused
- User prefers keyboard input

### Test Steps
1. Click in message input field
2. Type message: "What's a quick breakfast?"
3. Press "Enter" key (not Shift+Enter)
4. Observe submission

### Expected Results
- Message is submitted on "Enter" key press
- Message appears in chat
- Input field is cleared
- Bot begins processing
- NO line break added to message

### Special Case: Shift+Enter should add newline
- If user presses Shift+Enter: adds newline, doesn't send
- Useful for multi-line messages

### Postconditions
- Message submitted successfully
- User can continue chatting

### Test Data
```
Trigger: Enter key
Expected: Message sent
Input text: "What's a quick breakfast?"
```

### Pass/Fail Criteria
- ✅ PASS: Enter submits, Shift+Enter adds newline
- ❌ FAIL: Enter doesn't work or sends Shift+Enter message

---

## Test Case 7: Bot Typing Indicator

**Test Case ID:** CHAT_007  
**Feature:** Typing Indicator  
**Component:** ChatbotWidget.jsx, isBotTyping state  
**Priority:** Low  
**Severity:** Low

### Preconditions
- Message has been sent
- Bot is processing response
- Network latency allows observable delay

### Test Steps
1. Send message to chatbot
2. Observe chat area before response arrives
3. Look for typing indicator
4. Wait for bot response to appear

### Expected Results
- While bot processes (isBotTyping = true):
  - "..." or animated dots appear from bot
  - User cannot send another message (Send button disabled)
  - After response arrives, typing indicator disappears
- Typing indicator shows bot is thinking
- User experience clear bot is active

### Postconditions
- Bot response replaces typing indicator
- User can send another message

### Test Data
```
State: isBotTyping = true during processing
Expected indicator: animated dots or "Gastro AI is thinking..."
```

### Pass/Fail Criteria
- ✅ PASS: Typing indicator visible, disappears on response
- ❌ FAIL: No indicator, confusing UX

---

## Test Case 8: Message History Display

**Test Case ID:** CHAT_008  
**Feature:** Chat History  
**Component:** ChatbotWidget.jsx, messages array  
**Priority:** High  
**Severity:** High

### Preconditions
- Multiple messages have been exchanged
- Chat history is populated
- User wants to review conversation

### Test Steps
1. Expand chatbot widget
2. Scroll up in message area
3. Observe all previous messages
4. Verify message order (oldest to newest)
5. Verify timestamps on messages

### Expected Results
- All messages visible in chronological order
- User messages appear right-aligned with blue/primary color
- Bot messages appear left-aligned with gray color
- Each message shows timestamp (HH:MM format)
- Messages are properly formatted and readable
- No message truncation
- Scroll history works smoothly

### Postconditions
- User can review entire conversation
- Context maintained for bot responses

### Test Data
```
Example history:
1. User (14:30): "What can I cook with chicken?"
2. Bot (14:31): "Here are some delicious chicken recipes..."
3. User (14:32): "Can you make it vegetarian?"
4. Bot (14:33): "Sure! Here are vegetarian options..."
```

### Pass/Fail Criteria
- ✅ PASS: Full history visible, correct order, timestamps accurate
- ❌ FAIL: Messages missing, wrong order, or truncated

---

## Test Case 9: Auto-scroll to Latest Message

**Test Case ID:** CHAT_009  
**Feature:** Auto-scroll on New Message  
**Component:** ChatbotWidget.jsx, bottomRef  
**Priority:** Medium  
**Severity:** Medium

### Preconditions
- Chat history is long (10+ messages)
- User has scrolled up to see earlier messages
- New message arrives from bot

### Test Steps
1. Send a message
2. Quickly scroll up to see old messages
3. Wait for bot response
4. Observe chat position

### Expected Results
- When new message arrives (bot response):
  - Chat automatically scrolls to bottom
  - Latest message is visible
  - Smooth scroll animation (not instant jump)
- User doesn't need manual scroll to see response
- Behavior is consistent

### Postconditions
- User sees new message immediately
- No missed responses

### Test Data
```
Trigger: New bot message arrives
Expected: Auto-scroll to bottom
Duration: smooth animation
```

### Pass/Fail Criteria
- ✅ PASS: Auto-scrolls smoothly to latest message
- ❌ FAIL: Doesn't scroll or scroll is jarring

---

## Test Case 10: Error Handling - Bot Connection Error

**Test Case ID:** CHAT_010  
**Feature:** Error Handling  
**Component:** ChatbotWidget.jsx, error handling  
**Priority:** High  
**Severity:** High

### Preconditions
- Message sent to chatbot
- API endpoint `/api/chatbot/message` is unavailable
- Network error occurs

### Test Steps
1. Send message: "What's for dinner?"
2. Simulate API error (Network tab: mark endpoint as offline)
3. Wait for response timeout
4. Observe error handling

### Expected Results
- User message still appears in chat
- Loading indicator shows briefly
- Error message appears from bot:
  - "I couldn't reach Gastro AI right now. Please try again."
  - Or: "Sorry, I'm having trouble responding. Please try again later."
- User can send another message
- No crash or freeze

### Postconditions
- Chat remains functional
- User can retry sending message
- Error is user-friendly

### Test Data
```
Trigger: API timeout or network error
Expected message: "I couldn't reach Gastro AI right now..."
```

### Pass/Fail Criteria
- ✅ PASS: Error handled gracefully, user-friendly message
- ❌ FAIL: Chat crashes, error message confusing, or no recovery

---

## Test Case 11: Response Abort on Widget Close

**Test Case ID:** CHAT_011  
**Feature:** Request Cancellation  
**Component:** ChatbotWidget.jsx, abortController  
**Priority:** Medium  
**Severity:** Medium

### Preconditions
- Message sent to bot
- Bot is processing response (2-3 second delay)
- Response not yet received

### Test Steps
1. Send message
2. Wait 1 second for bot to start processing
3. Click collapse/close button to close widget
4. Wait 5 seconds
5. Re-open widget

### Expected Results
- When widget closes during bot response:
  - API request is cancelled (abortController.abort() called)
  - No response message is added to chat
  - No error message appears
- When widget re-opens:
  - Chat history preserved
  - User can send new message
  - No lingering requests in network

### Postconditions
- No wasted API calls
- Clean state on re-open
- Efficient resource usage

### Test Data
```
Action: Close widget during API call
Expected: Request aborted cleanly
```

### Pass/Fail Criteria
- ✅ PASS: Request cancelled, clean state on re-open
- ❌ FAIL: Request completes anyway or orphaned response appears

---

## Test Case 12: Clear Chat History

**Test Case ID:** CHAT_012  
**Feature:** Chat Reset  
**Component:** ChatbotWidget.jsx  
**Priority:** Low  
**Severity:** Low

### Preconditions
- Chat history has multiple messages
- User wants to start fresh conversation

### Test Steps
1. Open chatbot widget with existing history
2. Look for "Clear" or "New Chat" button
3. Click to clear history
4. Verify chat is cleared

### Expected Results
- Clear button visible in widget header
- Clicking clears all messages
- Chat returns to initial state with suggestions
- User can start new conversation
- Previous context not used in next messages

### Postconditions
- Fresh chat ready
- No message history

### Pass/Fail Criteria
- ✅ PASS: Clear button works, history removed, suggestions return
- ❌ FAIL: History persists or suggestions missing

---

## Test Case 13: Long-form Response Handling

**Test Case ID:** CHAT_013  
**Feature:** Long Responses  
**Component:** ChatbotWidget.jsx, ChatbotBubble.jsx  
**Priority:** Medium  
**Severity:** Medium

### Preconditions
- Bot is expected to provide detailed response
- Message: "Give me a detailed step-by-step recipe for homemade pasta"

### Test Steps
1. Send message requesting detailed recipe
2. Wait for bot response
3. Observe how response is displayed
4. Scroll through response if needed

### Expected Results
- Long response is properly formatted:
  - Line breaks preserved
  - Readable font size
  - Proper spacing
  - No text overflow
- Response fits in chat bubble:
  - Max width set appropriately
  - Text wraps correctly
  - Scrollbar appears if needed
- Response includes formatting:
  - Steps numbered if present
  - Lists formatted
  - Bold/italic preserved if markdown used

### Postconditions
- User can read entire response
- Response is well-formatted
- Chat remains scrollable

### Test Data
```
Input: "Give me a detailed step-by-step recipe for homemade pasta"
Expected output: Multi-paragraph response with steps
```

### Pass/Fail Criteria
- ✅ PASS: Long response formatted properly, readable
- ❌ FAIL: Text overflows, truncated, or unformatted

---

## Test Case 14: Input Field Validation

**Test Case ID:** CHAT_014  
**Feature:** Input Validation  
**Component:** ChatbotWidget.jsx, sendMessage  
**Priority:** Medium  
**Severity:** Low

### Preconditions
- Chatbot widget is open
- User attempts to send empty/invalid input

### Test Steps
1. Click in input field
2. Leave empty and click "Send"
3. Try sending only whitespace: "   "
4. Observe validation

### Expected Results
- Empty message cannot be sent:
  - "Send" button disabled if input empty
  - OR error message: "Please enter a message"
- Whitespace-only message trimmed and rejected
- User cannot send blank messages
- User can still type and send valid message after

### Postconditions
- No empty messages in history
- Valid validation behavior

### Test Data
```
Invalid inputs: "" , "   " , "\n\n"
Expected: All rejected
```

### Pass/Fail Criteria
- ✅ PASS: Empty messages rejected, validation works
- ❌ FAIL: Empty messages sent to backend

---

## Test Case 15: Message Persistence on Widget Close

**Test Case ID:** CHAT_015  
**Feature:** Chat Persistence  
**Component:** ChatbotWidget.jsx, React state  
**Priority:** Low  
**Severity:** Low

### Preconditions
- Multiple messages exchanged with bot
- Widget will be closed and reopened
- Page session continues

### Test Steps
1. Chat with bot: 5+ messages exchanged
2. Close chatbot widget (collapse)
3. Continue browsing for 30 seconds
4. Re-open chatbot widget
5. Verify chat history

### Expected Results
- Chat history is preserved:
  - All previous messages still visible
  - Same conversation context
  - Message order maintained
- User can continue conversation
- Context is remembered
- No message loss

### Postconditions
- Seamless conversation experience
- Context maintained

### Test Data
```
Duration: 30 seconds of widget closed
Expected: History fully preserved
```

### Pass/Fail Criteria
- ✅ PASS: All messages preserved, context maintained
- ❌ FAIL: Messages lost or context forgotten

---

## Integration Tests

### Test Case 16: Chat Widget Integration with Feed

**Test Case ID:** CHAT_016  
**Type:** Integration Test  
**Priority:** High

### Scenario: User chatting while browsing feed

**Steps:**
1. User on Feed page with posts visible
2. Open chatbot widget
3. Send message to bot
4. While bot is responding, scroll feed
5. Receive bot response
6. Continue chatting

**Assertions:**
- ✅ Feed scrolls independently of chat
- ✅ Chat remains functional during feed scroll
- ✅ Bot response arrives despite feed activity
- ✅ No performance degradation
- ✅ Chat doesn't interfere with feed interactions

---

### Test Case 17: Multi-topic Conversation

**Test Case ID:** CHAT_017  
**Type:** Conversation Flow Test  
**Priority:** Medium

### Scenario: Complex conversation with context switching

**Steps:**
1. Ask: "How do I make risotto?"
2. Bot responds with recipe
3. Ask: "Can I make it with seafood?"
4. Bot responds with seafood variation
5. Ask: "What wine pairs with this?"
6. Bot responds with wine recommendations

**Assertions:**
- ✅ Each response relevant to context
- ✅ Bot remembers previous messages
- ✅ Context properly maintained
- ✅ Conversation flows naturally
- ✅ No lost context between turns

---

## Test Execution Summary

| Test ID | Feature | Status | Notes |
|---------|---------|--------|-------|
| CHAT_001 | Widget Init | ⬜ | To be executed |
| CHAT_002 | Expansion | ⬜ | To be executed |
| CHAT_003 | Suggestions | ⬜ | To be executed |
| CHAT_004 | Suggestion Send | ⬜ | To be executed |
| CHAT_005 | Custom Input | ⬜ | To be executed |
| CHAT_006 | Enter Key | ⬜ | To be executed |
| CHAT_007 | Typing Indicator | ⬜ | To be executed |
| CHAT_008 | Message History | ⬜ | To be executed |
| CHAT_009 | Auto-scroll | ⬜ | To be executed |
| CHAT_010 | Error Handling | ⬜ | To be executed |
| CHAT_011 | Request Abort | ⬜ | To be executed |
| CHAT_012 | Clear History | ⬜ | To be executed |
| CHAT_013 | Long Response | ⬜ | To be executed |
| CHAT_014 | Input Validation | ⬜ | To be executed |
| CHAT_015 | Persistence | ⬜ | To be executed |
| CHAT_016 | Feed Integration | ⬜ | To be executed |
| CHAT_017 | Multi-topic | ⬜ | To be executed |

---

## Notes for QA
- Mock `/api/chatbot/message` responses with realistic delays (2-5 seconds)
- Test different response types: short, long, formatted, error
- Verify network requests in DevTools
- Test abort controller functionality
- Check localStorage for any chat persistence
- Test on mobile (responsive design)
- Verify message styling and accessibility
- Test with very long input and responses
- Simulate slow network conditions
