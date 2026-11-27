// Base, simple past and -ing forms. The last column, where present, accepts
// an alternate spelling or a distinct past participle.
const rows = `
ask asked asking
correct corrected correcting
hand handed handing
lay laid laying
mark marked marking
match matched matching
peel peeled peeling
place placed placing
save saved saving
steam steamed steaming
tag tagged tagging
watch watched watching
accept accepted accepting
access accessed accessing
accompany accompanied accompanying
achieve achieved achieving
adapt adapted adapting
add added adding
address addressed addressing
adjust adjusted adjusting
administer administered administering
advise advised advising
allocate allocated allocating
analyse analysed analysing analyze,analyzed,analyzing
answer answered answering
apply applied applying
approve approved approving
archive archived archiving
arrange arranged arranging
assemble assembled assembling
assess assessed assessing
assign assigned assigning
assist assisted assisting
attach attached attaching
audit audited auditing
authorise authorised authorising authorize,authorized,authorizing
balance balanced balancing
bake baked baking
bill billed billing
book booked booking
brief briefed briefing
bring brought bringing
build built building
buy bought buying
calculate calculated calculating
calibrate calibrated calibrating
call called calling
cancel cancelled cancelling canceled,canceling
capture captured capturing
carry carried carrying
cash cashed cashing
categorise categorised categorising categorize,categorized,categorizing
change changed changing
charge charged charging
check checked checking
clean cleaned cleaning
clear cleared clearing
close closed closing
coach coached coaching
collect collected collecting
combine combined combining
communicate communicated communicating
compare compared comparing
compile compiled compiling
complete completed completing
conduct conducted conducting
confirm confirmed confirming
connect connected connecting
contact contacted contacting
control controlled controlling
coordinate coordinated coordinating
copy copied copying
count counted counting
cover covered covering
create created creating
cut cut cutting
deal dealt dealing
decorate decorated decorating
delegate delegated delegating
deliver delivered delivering
describe described describing
design designed designing
detect detected detecting
develop developed developing
diagnose diagnosed diagnosing
direct directed directing
disinfect disinfected disinfecting
dispatch dispatched dispatching
display displayed displaying
distribute distributed distributing
document documented documenting
draft drafted drafting
draw drew drawing drawn
dress dressed dressing
drive drove driving driven
edit edited editing
email emailed emailing
empty emptied emptying
encourage encouraged encouraging
enforce enforced enforcing
enter entered entering
escalate escalated escalating
estimate estimated estimating
evaluate evaluated evaluating
examine examined examining
exchange exchanged exchanging
explain explained explaining
export exported exporting
feed fed feeding
file filed filing
fill filled filling
fit fitted fitting
fix fixed fixing
flag flagged flagging
fold folded folding
follow followed following
forecast forecast forecasting forecasted
format formatted formatting
forward forwarded forwarding
gather gathered gathering
give gave giving given
grade graded grading
greet greeted greeting
guide guided guiding
handle handled handling
heat heated heating
help helped helping
hire hired hiring
identify identified identifying
implement implemented implementing
import imported importing
improve improved improving
increase increased increasing
index indexed indexing
inform informed informing
inspect inspected inspecting
install installed installing
instruct instructed instructing
introduce introduced introducing
investigate investigated investigating
issue issued issuing
keep kept keeping
label labelled labelling labeled,labeling
lead led leading
lift lifted lifting
list listed listing
load loaded loading
log logged logging
maintain maintained maintaining
make made making
manage managed managing
measure measured measuring
meet met meeting
mentor mentored mentoring
mix mixed mixing
monitor monitored monitoring
mop mopped mopping
move moved moving
negotiate negotiated negotiating
note noted noting
notify notified notifying
observe observed observing
offer offered offering
onboard onboarded onboarding
open opened opening
operate operated operating
order ordered ordering
organise organised organising organize,organized,organizing
pack packed packing
paint painted painting
pass passed passing
patrol patrolled patrolling
pay paid paying
perform performed performing
pick picked picking
plan planned planning
polish polished polishing
post posted posting
pour poured pouring
prepare prepared preparing
present presented presenting
press pressed pressing
prevent prevented preventing
price priced pricing
print printed printing
prioritise prioritised prioritising prioritize,prioritized,prioritizing
process processed processing
produce produced producing
proofread proofread proofreading
protect protected protecting
provide provided providing
purchase purchased purchasing
put put putting
raise raised raising
read read reading
receive received receiving
recommend recommended recommending
reconcile reconciled reconciling
record recorded recording
recruit recruited recruiting
reduce reduced reducing
refer referred referring
refill refilled refilling
refund refunded refunding
register registered registering
relay relayed relaying
remove removed removing
renew renewed renewing
repair repaired repairing
replace replaced replacing
replenish replenished replenishing
report reported reporting
research researched researching
reserve reserved reserving
reset reset resetting
resolve resolved resolving
respond responded responding
restock restocked restocking
retrieve retrieved retrieving
return returned returning
review reviewed reviewing
rinse rinsed rinsing
route routed routing
run ran running
sanitise sanitised sanitising sanitize,sanitized,sanitizing
scan scanned scanning
schedule scheduled scheduling
seal sealed sealing
secure secured securing
select selected selecting
sell sold selling
send sent sending
separate separated separating
serve served serving
set set setting
share shared sharing
ship shipped shipping
show showed showing shown
sign signed signing
sort sorted sorting
speak spoke speaking spoken
stack stacked stacking
stock stocked stocking
store stored storing
submit submitted submitting
suggest suggested suggesting
summarise summarised summarising summarize,summarized,summarizing
supervise supervised supervising
support supported supporting
sweep swept sweeping
take took taking taken
teach taught teaching
test tested testing
tidy tidied tidying
track tracked tracking
train trained training
transfer transferred transferring
translate translated translating
transport transported transporting
troubleshoot troubleshot troubleshooting
unload unloaded unloading
update updated updating
upload uploaded uploading
use used using
vacuum vacuumed vacuuming
validate validated validating
verify verified verifying
visit visited visiting
wash washed washing
weigh weighed weighing
welcome welcomed welcoming
wipe wiped wiping
work worked working
wrap wrapped wrapping
write wrote writing written
`.trim().split("\n");

type VerbForms = { base: string; past: string; gerund: string };

const byForm = new Map<string, VerbForms>();
for (const row of rows) {
  const [base, past, gerund, alternates] = row.split(" ");
  const forms = { base, past, gerund };
  const singular = /[^aeiou]y$/.test(base) ? `${base.slice(0, -1)}ies`
    : /(?:[sxz]|ch|sh|do)$/.test(base) ? `${base}es` : `${base}s`;
  for (const form of [base, past, gerund, singular, ...(alternates?.split(",") ?? [])]) {
    byForm.set(form, forms);
  }
}

export function getVerbForms(word: string) {
  return byForm.get(word.toLowerCase());
}
