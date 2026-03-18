# User Journeys — MicroBlog Platform

> Artifacts: UJ-MB-001 through UJ-MB-003
> Source: US-MB-001 through US-MB-015

---

## UJ-MB-001 — New Visitor Discovers, Registers, Posts First Update

**Persona:** Maya (Casual Reader → converts to Member)
**Entry point:** Direct URL or search result
**Goal:** Go from anonymous visitor to posting first update

```
[Step 1] VISITOR LANDS ON EXPLORE PAGE
  Actor: Visitor
  Screen: /explore (public, no auth)
  Action: Arrives on platform; sees public post feed without logging in
  Emotion: Curious — "what is this?"
  ──────────────────────────────────────────────────────

[Step 2] VISITOR BROWSES PUBLIC POSTS
  Actor: Visitor
  Screen: /explore
  Action: Scrolls feed; reads posts; clicks on a post to see thread
  Emotion: Interested — finds relevant content
  Decision: "I want to like this / follow this person"
  ──────────────────────────────────────────────────────

[Step 3] VISITOR HITS AUTH GATE
  Actor: Visitor
  Screen: Like or Follow action triggers auth prompt
  Action: Clicks Like on a post → modal prompt: "Sign in to like posts"
  Emotion: Slight friction — justified by context
  Decision: Clicks "Create Account"
  ──────────────────────────────────────────────────────

[Step 4] VISITOR COMPLETES REGISTRATION FORM
  Actor: Visitor → becoming Member
  Screen: /register
  Action: Enters username, email, password; clicks Sign Up
  Happy path: Form validates inline; submits successfully
  Error path: Sees field-level error if username taken or password weak
  Emotion: Motivated — wants to complete to get back to content
  ──────────────────────────────────────────────────────

[Step 5] SYSTEM CREATES ACCOUNT AND REDIRECTS
  Actor: System
  Action: Creates account; returns access token; redirects to /home
  ──────────────────────────────────────────────────────

[Step 6] NEW MEMBER SEES EMPTY TIMELINE + ONBOARDING PROMPT
  Actor: Member
  Screen: /home (empty state)
  Action: Sees "Follow people to see their posts here" prompt + suggestions
  Emotion: Guided — knows what to do next
  ──────────────────────────────────────────────────────

[Step 7] MEMBER FOLLOWS SUGGESTED USERS
  Actor: Member
  Screen: /home (follow suggestions)
  Action: Clicks Follow on 3 suggested accounts
  Emotion: Engaged — timeline starts populating
  ──────────────────────────────────────────────────────

[Step 8] MEMBER COMPOSES AND POSTS FIRST UPDATE
  Actor: Member
  Screen: /home — compose area at top of feed
  Action: Clicks compose; types text; clicks Post
  Emotion: Accomplished — "I'm part of this"
  ──────────────────────────────────────────────────────

[Step 9] POST APPEARS IN FEED
  Actor: System → Member
  Action: Post published; appears at top of member's profile; fan-out begins
  Emotion: Satisfaction — immediate feedback confirms success
```

**Touchpoints:** Explore feed, Post card, Auth gate modal, Registration form, Home timeline empty state, Compose area
**Key UX principle:** Delay auth gate as long as possible — let visitor see value before asking for registration.

---

## UJ-MB-002 — Returning Member Daily Check-In and Engagement Loop

**Persona:** Kai (Active Poster)
**Entry point:** Direct app open / browser tab
**Goal:** Read new content, engage (like/reply), post something new

```
[Step 1] MEMBER OPENS APP / NAVIGATES TO /home
  Actor: Member
  Screen: /home
  Action: App loads; access token refreshed if needed
  Emotion: Habitual — "what did I miss?"
  ──────────────────────────────────────────────────────

[Step 2] MEMBER SEES "SHOW N NEW POSTS" BANNER
  Actor: Member
  Screen: /home — new posts banner at top
  Action: Clicks banner to load new posts
  Emotion: Anticipation — pull to refresh equivalent
  ──────────────────────────────────────────────────────

[Step 3] MEMBER SCROLLS AND READS TIMELINE
  Actor: Member
  Screen: /home — post cards
  Action: Reads posts; pauses on interesting ones
  ──────────────────────────────────────────────────────

[Step 4] MEMBER LIKES A POST
  Actor: Member
  Screen: Post card action bar
  Action: Taps Heart icon → like count increments; icon fills (primary blue)
  Emotion: Quick satisfaction — minimal effort engagement
  ──────────────────────────────────────────────────────

[Step 5] MEMBER OPENS A THREAD TO REPLY
  Actor: Member
  Screen: /posts/:postId (thread view)
  Action: Taps post → full thread opens; reads replies; taps Reply
  Emotion: Conversational — wants to add to the discussion
  ──────────────────────────────────────────────────────

[Step 6] MEMBER WRITES AND SUBMITS REPLY
  Actor: Member
  Screen: Reply compose area (inline below post)
  Action: Types reply (280 char limit shown); clicks Reply
  Emotion: Contributing — part of the conversation
  ──────────────────────────────────────────────────────

[Step 7] MEMBER COMPOSES A NEW POST
  Actor: Member
  Screen: /home — compose box or floating action button (mobile)
  Action: Clicks compose; types; clicks Post
  ──────────────────────────────────────────────────────

[Step 8] MEMBER CHECKS NOTIFICATIONS
  Actor: Member
  Screen: /notifications
  Action: Taps notification icon (badge shows unread count); reads likes, replies, follows
  Emotion: Validated — sees engagement on their content
```

**Touchpoints:** Home timeline, Post card, Thread detail, Compose (inline + FAB), Notifications
**Key UX principle:** Every engagement action (like, reply, follow) must give immediate visual feedback — no wait state for optimistic updates.

---

## UJ-MB-003 — Member Discovers and Follows New Accounts via Explore

**Persona:** Priya (Social Connector)
**Entry point:** Notification → explore intent
**Goal:** Find new interesting accounts, build curated following list

```
[Step 1] MEMBER NAVIGATES TO /explore
  Actor: Member
  Screen: /explore
  Action: Taps Explore in navigation; sees latest public posts
  ──────────────────────────────────────────────────────

[Step 2] MEMBER SEARCHES FOR A TOPIC OR USERNAME
  Actor: Member
  Screen: /explore — search bar at top
  Action: Types keyword (e.g. "design"); sees posts + matching users
  Emotion: Discovery mode — looking for signals of quality
  ──────────────────────────────────────────────────────

[Step 3] MEMBER CLICKS ON AN INTERESTING USER'S NAME
  Actor: Member
  Screen: /users/:username (profile page)
  Action: Reads bio, sees post history, notes follower count
  Decision: "Is this person worth following?"
  ──────────────────────────────────────────────────────

[Step 4] MEMBER CLICKS FOLLOW ON THE PROFILE
  Actor: Member
  Screen: Profile page header
  Action: Clicks Follow → button immediately changes to "Following" (optimistic)
  Emotion: Committed — added to network
  ──────────────────────────────────────────────────────

[Step 5] MEMBER RETURNS TO EXPLORE AND CONTINUES DISCOVERY
  Actor: Member
  Screen: /explore
  Action: Browser back → sees search results; continues scrolling
  ──────────────────────────────────────────────────────

[Step 6] MEMBER DECIDES TO UNFOLLOW SOMEONE
  Actor: Member
  Screen: Profile page or post card
  Action: Clicks "Following" button → hover shows "Unfollow" (destructive preview)
  Decision: Confirms → button reverts to "Follow"
  Emotion: Control — curating their feed deliberately
  ──────────────────────────────────────────────────────

[Step 7] MEMBER CHECKS UPDATED TIMELINE
  Actor: Member
  Screen: /home
  Action: Returns to home; sees new posts from newly followed accounts
  Emotion: Satisfied — timeline feels more relevant
```

**Touchpoints:** Explore feed, Search results, Profile page, Follow/Unfollow button
**Key UX principle:** Follow state must be unambiguous at all times — button label, colour, and icon must all communicate the current state clearly.
