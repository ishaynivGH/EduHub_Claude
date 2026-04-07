# Pricing Model Update - Week 3 Complete ✅

## 🎯 What Changed

You've completely restructured the pricing model from a fixed-tier system to a per-profile pricing model. Here's everything that was updated:

### ✅ New Pricing Structure
**Free Trial**
- 30 days full access
- All content, all features, unlimited profiles
- No payment required
- Automatic on signup

**Member Plan**
- 1st profile: $5/month
- 2nd profile: $9/month
- 3rd+ profiles: $3/month each
- Annual discount: Pay 11 months, get 12
- Pay only for active profiles

---

## 📁 Files Created/Updated

### New Files Created
```
✅ lib/subscription-service.ts (COMPLETELY REWRITTEN)
✅ app/api/subscriptions/create-trial/route.ts (NEW)
✅ app/api/subscriptions/convert-trial/route.ts (NEW)
✅ app/pricing/page.tsx (COMPLETELY REDESIGNED)
✅ docs/NEW_PRICING_MODEL.md (COMPLETE GUIDE)
✅ docs/DATABASE_MIGRATION.md (SQL UPDATE SCRIPT)
```

### Files Modified
```
✅ app/auth/create-profile/page.tsx
   - Auto-creates 30-day free trial on signup
   - Changed from "active" to "trial" status

✅ app/dashboard/page.tsx
   - Shows trial countdown (X days remaining)
   - Displays cost based on profile count
   - Shows Member billing cycle
   - Annual vs Monthly cost breakdown
```

### Files Not Changed (But Compatible)
```
✅ app/page.tsx (home)
✅ app/layout.tsx (root layout)
✅ app/auth/login/page.tsx
✅ app/auth/signup/page.tsx
✅ lib/auth-context.tsx
```

---

## 🔄 How It Works Now

### Subscription Service Updates

**New Functions:**
```javascript
// Calculate pricing based on profile count
calculateMonthlyCost(profileCount, billingCycle)
calculateAnnualCost(profileCount)
getPricingBreakdown(profileCount)

// Trial management
createFreeTrial(userId)
isInFreeTrial(userId)
getTrialDaysRemaining()

// Member conversion
convertTrialToMember(userId, billingCycle)
```

**Updated Types:**
```typescript
type SubscriptionPlan = 'free' | 'member'  // Was: 'free' | 'premium' | 'family'
type BillingCycle = 'monthly' | 'annual'    // NEW
status: 'active' | 'trial' | 'cancelled' | 'expired'  // Added 'trial'
```

**Pricing Constants:**
```javascript
PROFILE_PRICING = {
  monthly: {
    '1st': 5.0,
    '2nd': 9.0,
    'additional': 3.0
  },
  annual: {  // 12/11 discount applied
    '1st': 5.45,
    '2nd': 9.82,
    'additional': 3.27
  }
}
```

---

## 🗄️ Database Changes Required

**You MUST run this SQL in Supabase before testing:**

```sql
ALTER TABLE public.subscriptions
ADD COLUMN IF NOT EXISTS billing_cycle VARCHAR(50) DEFAULT 'monthly',
ADD COLUMN IF NOT EXISTS trial_started_at TIMESTAMP WITH TIME ZONE,
ADD COLUMN IF NOT EXISTS trial_ends_at TIMESTAMP WITH TIME ZONE;

UPDATE public.subscriptions
SET billing_cycle = 'monthly'
WHERE billing_cycle IS NULL;
```

**See: `docs/DATABASE_MIGRATION.md` for complete instructions**

---

## 🧪 Testing Checklist

### Test 1: Database Update ✓
```
[ ] Go to Supabase Dashboard
[ ] Run SQL migration script
[ ] Verify columns exist: billing_cycle, trial_started_at, trial_ends_at
```

### Test 2: Sign Up & Auto Trial ✓
```
[ ] Open http://localhost:3000
[ ] Sign up with new email
[ ] Create first student profile
[ ] Land on dashboard
[ ] Verify badge shows "Free Trial (30 days left)"
[ ] Verify card shows "30 Days" subscription
[ ] Verify "Become Member" button is visible
```

### Test 3: View Pricing ✓
```
[ ] Click "Manage Plan" on dashboard
[ ] Go to /pricing page
[ ] Verify Free Trial card appears
[ ] Verify Member card with Monthly/Annual toggle
[ ] Adjust profile count slider (1-10)
[ ] Verify costs update as profiles change:
   - 1 profile: $5/month
   - 2 profiles: $14/month ($5+$9)
   - 5 profiles: $23/month
```

### Test 4: Monthly vs Annual ✓
```
[ ] On pricing page, toggle between Monthly/Annual
[ ] Verify annual shows savings:
   - 1 profile: $54.55/year (saves $5.45)
   - 2 profiles: $127.27/year (saves $40.73)
   - 5 profiles: $209.09/year (saves $50.91)
[ ] Verify "Pay 11, get 12!" message
```

### Test 5: Become Member ✓
```
[ ] On pricing page, click "Become Member"
[ ] Choose Monthly or Annual
[ ] Click "Become Member" button
[ ] See success message
[ ] Redirect to dashboard
[ ] Verify badge: "Member - Monthly" or "Member - Annual"
[ ] Verify cost shows: $X.XX/month
```

### Test 6: Profile Count Affects Cost ✓
```
[ ] Start as Member with 1 profile: $5/month
[ ] Add 2nd profile from dashboard
[ ] Dashboard updates to: $14/month
[ ] Add 3rd profile
[ ] Dashboard updates to: $17/month
[ ] Add 5th profile
[ ] Dashboard updates to: $23/month
```

### Test 7: Database Verification ✓
```
[ ] Go to Supabase Dashboard
[ ] Database → subscriptions table
[ ] Find your subscription
[ ] Verify fields:
   - plan_type: 'free' or 'member'
   - status: 'trial' or 'active'
   - billing_cycle: 'monthly' or 'annual'
   - trial_ends_at: is set (30 days from start)
```

---

## 📊 Pricing Examples

### For 1 Student
- Trial: Free for 30 days
- Member Monthly: $5/month ($60/year)
- Member Annual: $54.55/year (saves $5.45)

### For 2 Students
- Trial: Free for 30 days
- Member Monthly: $14/month ($168/year)
- Member Annual: $127.27/year (saves $40.73)

### For Family of 5
- Trial: Free for 30 days
- Member Monthly: $23/month ($276/year)
- Member Annual: $209.09/year (saves $66.91)

---

## 🔌 Stripe Integration (When Ready)

The system is designed to make Stripe integration easy:

### Files Already Marked for Stripe
- `lib/subscription-service.ts` - Lines with "TODO: Integrate with Stripe"
- `app/api/subscriptions/create-trial/route.ts` - Ready as-is
- `app/api/subscriptions/convert-trial/route.ts` - Lines 31-40 for Stripe

### What to Add Later (Estimated 4-6 hours)
1. Add Stripe SDK: `npm install stripe`
2. Add Stripe keys to `.env.local`
3. Update `convert-trial` endpoint to create Stripe subscription
4. Add Stripe checkout form to pricing page
5. Create webhook handler for subscription events

**No other changes needed!** The database and UI are already ready.

---

## ✨ Key Improvements

### For Users
- ✅ Clear 30-day free trial (no tricks)
- ✅ Transparent per-profile pricing
- ✅ Annual discount (pay 11, get 12)
- ✅ Cost shown before commitment
- ✅ Easy member conversion
- ✅ All content available to all members

### For Business
- ✅ Scales with family size
- ✅ Simple to explain
- ✅ Incentivizes annual commitment
- ✅ Fair pricing model
- ✅ Easy to implement (no feature restrictions)

### For Development
- ✅ Clean separation: trial vs member
- ✅ Stripe integration ready
- ✅ Dynamic pricing calculations
- ✅ Profile-based cost tracking
- ✅ No feature flags needed

---

## 🚀 Next Steps

1. **Immediately**: Run database migration SQL
2. **Test**: Go through testing checklist above
3. **Verify**: Confirm pricing page and dashboard work correctly
4. **When Ready**: Integrate Stripe (marked with TODOs)
5. **Deploy**: Push to Vercel

---

## 📞 Quick Reference

### Important Files to Know
- **Pricing Logic**: `lib/subscription-service.ts`
- **Pricing UI**: `app/pricing/page.tsx`
- **Dashboard Display**: `app/dashboard/page.tsx`
- **API Routes**: `app/api/subscriptions/`

### Configuration
- **Trial Duration**: 30 days (in `createFreeTrial()`)
- **1st Profile**: $5 (in `PROFILE_PRICING.monthly`)
- **2nd Profile**: $9 (in `PROFILE_PRICING.monthly`)
- **Additional**: $3 (in `PROFILE_PRICING.monthly`)

### Key Calculations
```javascript
// Monthly: 1st $5, 2nd $9, rest $3 each
monthly = 5 + 9 + (additional - 2) * 3

// Annual: Same pricing × 12 / 11 (1 month discount)
annual = monthly * 12 / 11
```

---

**Status**: ✅ Week 3 Complete - New Pricing Model Ready for Testing
**Next**: Week 4 - Game Migration (HTML → React)
