# Quick Start: Simulation Testing (5-Minute Guide)

**TL;DR:** Want to test the simulations fast? Follow this express guide.

---

## ⚡ 5-Minute Quick Test

### 1. Build Check (30 seconds)
```bash
npm run build
```
✅ Should complete with no errors (chunk size warning is OK)

### 2. Launch App (30 seconds)
```bash
npm run dev
```
- Sign in with an approved Google account (requires Google Cloud OAuth already configured — see docs/OAUTH_MIGRATION_PLAN.md §1)
- Navigate to "Interactive Simulations" card
- Verify all 3 cards visible

### 3. Periodic Table (1 minute)
- Click "Interactive Periodic Table"
- Search for "oxygen" → should highlight O
- Click oxygen → modal opens with element data
- Click "Close"
- ✅ **Pass:** Search works, modal opens

### 4. Covalent Bonding (2 minutes)
- Go back, click "Covalent Bonding"
- Click "Add H" twice
- Click first H atom → click second H atom
- Click "Single Bond" button
- Both H atoms should glow green, bond line appears
- Formula shows "H₂"
- Click "Preset Molecules" → expand → click "Water (H₂O)"
- Water molecule loads with 3 atoms, 2 bonds
- ✅ **Pass:** Bonding works, presets load

### 5. Ionic Bonding (1 minute)
- Go back, click "Ionic Bonding"
- Click "Na" (sodium)
- Click "Cl" (chlorine)
- Click "Form Compound" or "Ionize"
- Formula shows "NaCl", name shows "Sodium Chloride"
- Lewis Transfer diagram animates electron moving from Na to Cl
- ✅ **Pass:** Compound formation works

---

## 🐛 Common Issues to Watch For

### If Build Fails:
- Check for TypeScript errors in console
- Ensure all imports are correct
- Run `npm install` if dependencies missing

### If Simulations Don't Load:
- Check browser console (F12) for errors
- Ensure you're signed in with an approved Google account (for internal dashboard) or access simulations directly from public landing
- Try refreshing page

### If Drag-and-Drop Doesn't Work:
- Drag at least 8 pixels to activate
- Ensure PointerSensor installed (@dnd-kit/core)
- Try different browser (Chrome recommended)

### If Formulas Look Wrong:
- Subscripts not showing → Check Unicode formatting
- Formula incorrect → Check Hill notation logic
- Charges missing → Check superscript mapping

---

## ✅ Pass Criteria (Quick Version)

**Simulations Hub:** 3 cards visible, navigation works
**Periodic Table:** Search + element modal work
**Covalent Bonding:** Can build H₂, presets load
**Ionic Bonding:** Can form NaCl

If all 4 pass → ✅ **Core functionality working!**

---

## 📚 Full Testing?

For comprehensive testing (90 minutes):
- See [SIMULATION_TESTING_GUIDE.md](./SIMULATION_TESTING_GUIDE.md)

For detailed walkthrough (all features):
- See [SIMULATION_CLEANUP_SUMMARY.md](./SIMULATION_CLEANUP_SUMMARY.md)

---

**Quick Status Check:**
- [ ] Build passes
- [ ] Hub loads
- [ ] Periodic Table works
- [ ] Covalent Bonding works
- [ ] Ionic Bonding works

**5 checkboxes checked = Ready to go! 🚀**
