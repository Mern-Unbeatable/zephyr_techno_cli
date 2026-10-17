import React from 'react';
import Container from '../../../layout/Container';
import { FileText, Smartphone } from 'lucide-react';

const introText = `Please read these terms carefully before you place an order to sell a phone to us. Pay particular attention to the Condition Grades below, clause 8 (Revised offers), clause 10 (Locked devices), clause 11 (Lost, stolen and blocked devices) and clause 16 (Fraud prevention and recovery). They explain when we may pay you less than your quote, or nothing, for a device, and what happens if a device is later blacklisted or locked.`;

const sections = [
    {
        id: 'condition-grades',
        number: '',
        title: 'CONDITION GRADES',
        blocks: [
            { p: `Choose the grade that accurately describes your phone. The full grading rules are in clause 6.` },
            {
                grade: 'SEALED',
                bullets: [
                    `Original manufacturer box with the factory seal/shrink-wrap fully intact and unbroken; all original contents inside; IMEI/serial on the box matches the Device.`,
                    `Never used, never activated and not registered to any account; manufacturer warranty not started.`,
                    `All original parts and in-box contents.`,
                ],
            },
            {
                grade: 'EXCELLENT',
                bullets: [
                    `Screen: no cracks, chips, lifting, dead pixels, lines, discolouration, pressure marks or screen burn. No more than 3 very light scratches that are only visible at an angle and cannot be felt with a fingernail.`,
                    `Body (frame, back, camera lens): no cracks, chips or dents. Back glass and camera lenses intact. No more than 5 light marks or micro-scratches.`,
                    `Battery: iPhone Maximum Capacity 85% or above and a battery cycle count under 500. Samsung: battery status reported as "Good"/"Normal" in Samsung's built-in diagnostics, and a cycle count under 500 where the Device reports it.`,
                    `Fully functional (see requirements below), all genuine parts with no "Unknown Part"/"non-genuine part" messages, and no engraving.`,
                    `Box and accessories not required. Please do not send them.`,
                ],
            },
            {
                grade: 'GOOD',
                bullets: [
                    `Screen: no cracks, chips, lifting, dead pixels, lines, discolouration, pressure marks or screen burn. Visible scratches are allowed if they do not affect the display when switched on and are not deep enough to catch a fingernail.`,
                    `Body: scuffs, scratches, minor dents and chipped paint on the frame are allowed. Back glass and camera lenses must not be cracked.`,
                    `Battery: iPhone Maximum Capacity 80% or above. Samsung: no "Weak"/"Bad" battery status. Battery cycle count does not matter for this grade.`,
                    `Fully functional (see requirements below), all genuine parts with no "Unknown Part"/"non-genuine part" messages, and no engraving.`,
                    `Box and accessories not required. Please do not send them.`,
                ],
            },
            {
                grade: 'BROKEN',
                intro: `Any one or more of the following:`,
                bullets: [
                    `cracked or chipped screen glass, deep scratches, lifting, dead pixels, lines, discolouration, pressure marks, screen burn, touch faults, or no display;`,
                    `cracked back glass or camera lens, a bent or deformed frame, heavy dents, or missing or damaged buttons;`,
                    `one or more faults, or the Device does not power on (see 6.5);`,
                    `non-genuine parts (accepted at a reduced price, see 12.2);`,
                    `engraving or personalisation.`,
                ],
                after: `Any battery health or cycle count is accepted, provided the battery is not swollen or leaking (see 13.6). Box and accessories not required.`,
            },
            { strong: `WE DO NOT BUY LIQUID-DAMAGED DEVICES AT ANY GRADE (see 6.6 and 12.4).` },
            {
                lead: `Requirements for all working grades (Sealed, Excellent, Good):`,
                items: [
                    ['(a)', `The Device is a genuine Apple or Samsung UK-market model, or a model we list as accepted, with original, unmodified software. It is not jailbroken or rooted and has no custom ROM.`],
                    ['(b)', `Every function works as the manufacturer intended: touchscreen, Face ID/Touch ID/fingerprint sensor, all cameras (including autofocus, flash and stabilisation), earpiece, loudspeakers, microphones, all buttons and switches, vibration, charging port and wireless charging (where fitted), Wi-Fi, Bluetooth, GPS, NFC, mobile signal on a UK network, SIM tray/eSIM, proximity sensor and accelerometer. The Device does not overheat, freeze, restart unexpectedly or get stuck in a boot loop.`],
                    ['(c)', `The Device is removed from all accounts and locks (clause 10).`],
                    ['(d)', `It is not registered as lost, stolen, blocked or barred, and is not subject to any finance or insurance flag (clause 11).`],
                ],
            },
        ],
    },
    {
        id: 'about-us',
        number: '1',
        title: 'ABOUT US',
        blocks: [
            { c: '1.1', t: `Zephyr Technology is the trading name of Zephyr Corp Ltd, a company registered in England and Wales (company number 15640926). Our registered office is The Porter Building, 1 Brunel Way, Slough, SL1 1FQ, United Kingdom. Our VAT number is GB478099142.` },
            { c: '1.2', t: `Devices must be sent to: The Porter Building, 1 Brunel Way, Slough, SL1 1FQ.` },
            { c: '1.3', t: `Contact us by email at support@zephyrtechnology.co.uk or by WhatsApp on 07500 990009. Our business hours are Monday to Friday, 9am–5:30pm, excluding bank holidays in England.` },
            { c: '1.4', t: `In these terms, "we", "us" and "our" mean Zephyr Corp Ltd. "You" means the person placing the order and sending the device.` },
        ],
    },
    {
        id: 'definitions',
        number: '2',
        title: 'DEFINITIONS',
        blocks: [
            {
                defs: [
                    ['Business Day', `Monday to Friday, excluding bank and public holidays in England.`],
                    ['Business Hours', `9am–5:30pm on a Business Day.`],
                    ['Device', `each mobile phone you offer to sell to us under an Order. We currently buy Apple iPhone and Samsung Galaxy phones only.`],
                    ['Grade', `the condition category described in the Condition Grades at the top of these terms (Sealed, Excellent, Good or Broken).`],
                    ['Inspection', `our check of the Device's identity, IMEI/serial number status, condition, functionality and account locks.`],
                    ['Order', `your request to sell one or more Devices to us.`],
                    ['Quote', `the price shown and confirmed to you by email for a Device of the model, storage, network status and Grade you selected.`],
                    ['Revised Offer', `a new price we offer after Inspection under clause 8.`],
                ],
            },
        ],
    },
    {
        id: 'who-can-sell',
        number: '3',
        title: 'WHO CAN SELL TO US',
        blocks: [
            {
                c: '3.1',
                t: `By placing an Order you confirm that:`,
                items: [
                    ['(a)', `you are at least 18 years old;`],
                    ['(b)', `you live in the United Kingdom and have a UK bank account or a PayPal account in your own name;`],
                    ['(c)', `you are the legal owner of the Device, or you are authorised in writing by the legal owner to sell it, and you have the right to sell it;`],
                    ['(d)', `the Device is not stolen, lost, blocked or barred, and is not subject to an outstanding insurance claim, an insurance payout, an unpaid finance or hire-purchase agreement, a lease, or any other claim or interest of another person;`],
                    ['(e)', `all the information you give us about yourself and the Device is true, accurate and complete.`],
                ],
                after: `These promises continue to apply after we have paid you (see clause 16).`,
            },
            { c: '3.2', t: `If you are selling Devices as a business (including buying phones to resell to us), you must tell us before ordering. Clauses that say they apply only to consumers will not apply to you. We may limit the number of Devices we accept from any one person or address to 5 Devices in any 30-day period without prior agreement.` },
            { c: '3.3', t: `We may refuse any Order or any Device, before or after it arrives, if we reasonably believe it does not meet these terms or if we cannot verify your identity or ownership. If we refuse a Device after it arrives for a reason that is not your fault, we will return it to you free of charge.` },
        ],
    },
    {
        id: 'how-it-works',
        number: '4',
        title: 'HOW THE PROCESS WORKS',
        blocks: [
            { c: '4.1', t: `Get a quote: choose your model, storage, network status and condition Grade. The Quote is based entirely on the information you give us.` },
            { c: '4.2', t: `Send your device: use our free postage service (clause 13) to send the Device to us within the validity period in clause 5.` },
            { c: '4.3', t: `Device inspection: we aim to check and verify your Device on the day it arrives or the next Business Day (clause 7).` },
            { c: '4.4', t: `Get paid: if the Device matches your Order, or once you accept a Revised Offer, we aim to send payment on the next Business Day after Inspection (clause 15).` },
            { c: '4.5', t: `A binding contract is formed when we email you to confirm your Order. When you place the Order, you will be asked to confirm you accept these terms. Please keep a copy. The version of these terms in force when you place your Order applies to that Order.` },
            { c: '4.6', t: `Recyclers and comparison websites: we work with phone recyclers and price comparison websites. Information about our service shown on other websites may be worded differently from these terms, but it describes a similar service. Condition grades may also have different names on other websites. For example, our Excellent grade may be shown as "Good", and our Good grade may be shown as "Poor". The condition each grade describes is similar.` },
        ],
    },
    {
        id: 'quote-validity',
        number: '5',
        title: 'QUOTE VALIDITY AND LATE ARRIVAL',
        blocks: [
            { c: '5.1', t: `Your Quote is valid for 14 days from the date of our Order confirmation email.` },
            { c: '5.2', t: `If your Device arrives after the 14 days, we will price it at our current price on the day it arrives for the same model, storage, network status and Grade. If the current price is lower than your Quote, we will email you and treat it as a Revised Offer under clause 8, which you may accept or reject. If it is the same or higher, we will pay your original Quote.` },
            { c: '5.3', t: `If the Device has not arrived within 30 days of your Order confirmation and you have not contacted us, we may cancel the Order. You can create a new Order at any time.` },
        ],
    },
    {
        id: 'grading-rules',
        number: '6',
        title: 'GRADING RULES',
        blocks: [
            { c: '6.1', t: `Choose the Grade that accurately describes your Device, using the Condition Grades at the top of these terms. The Device must also match the make, model, storage capacity, colour (where priced differently) and network status you selected. A Device that does not meet the requirements of the Grade you selected will be re-graded to the Grade it does meet.` },
            { c: '6.2', t: `Network status: if you tell us the Device is unlocked and it is locked to a network, we will make a Revised Offer at our price for the locked version.` },
            { c: '6.3', t: `Battery: if a Device otherwise meets Excellent but its battery cycle count is 500 or more, we will grade it as Good. If a Device otherwise meets Excellent or Good but its battery health is below 80% (iPhone) or reported as "Weak"/"Bad" (Samsung), we will not re-grade it to Broken. Instead, we will deduct a battery charge from the Quote and treat this as a Revised Offer. The amount depends on the model and will be shown in the Revised Offer.` },
            { c: '6.4', t: `Sealed devices: we will photograph the sealed box before opening it. We then need to open the seal to verify the Device, its IMEI/serial number and activation status. A Device that arrives with an intact seal and passes these checks remains Sealed even though we have opened it. If the seal is broken, missing or has been re-applied, or the Device has been activated or registered, we will re-grade it to Excellent, Good or Broken as applicable.` },
            { c: '6.5', t: `Broken devices: Broken covers a wide range of faults, so the Broken Quote assumes the Device powers on and displays an image. If your Broken Device does not power on, or has more than one major fault (for example, a cracked screen and a cracked back), we may make a Revised Offer to reflect the actual damage. Our reference prices for these cases are available on request.` },
            { c: '6.6', t: `Devices we do not buy at any Grade: liquid-damaged devices; counterfeit or cloned devices; devices with missing major internal components (for example, the battery or logic board); devices that are crushed, snapped, or have swollen or leaking batteries; and devices with tampered or altered IMEI/serial numbers. See clauses 11 and 12.` },
        ],
    },
    {
        id: 'inspection',
        number: '7',
        title: 'INSPECTION',
        blocks: [
            { c: '7.1', t: `We aim to inspect your Device on the same Business Day it arrives, or on the next Business Day. Devices that arrive on a weekend or bank holiday will be inspected on the next Business Day.` },
            { c: '7.1A', t: `Further checks: sometimes we need to carry out further checks before we can complete Inspection. For example, we may need to request your photo ID or proof of ownership, verify the Device's IMEI or serial number, or re-test the Device. If so, we will tell you, and Inspection may take longer, but no more than 5 Business Days. Where we have asked you for information or documents, the 5 Business Days start from when you provide them. This time limit does not apply to locked Devices (clause 10) or lost, stolen, blocked or flagged Devices (clause 11), which are dealt with under those clauses.` },
            { c: '7.2', t: `When your parcel arrives we will photograph the outer packaging as received and the Device on opening. We will photograph any defect that leads to a Revised Offer or a rejection. We keep these photos for at least 30 days after the Order is completed, or until any dispute or claim about the Order is resolved, whichever is later. If the packaging arrives visibly damaged, we will keep it for at least 14 days.` },
            { c: '7.3', t: `Inspection includes an IMEI/serial number check against CheckMEND and other industry databases for lost, stolen, blocked, finance and insurance flags. It also includes a diagnostic test of functionality, battery health and battery cycle count, and a check for account locks, MDM enrolment, liquid damage and non-genuine parts.` },
            { c: '7.4', t: `We may remove any case, skin or screen protector to inspect the Device. We will not return cases, skins or screen protectors.` },
        ],
    },
    {
        id: 'revised-offers',
        number: '8',
        title: 'REVISED OFFERS',
        blocks: [
            {
                c: '8.1',
                t: `If the Device does not match your Order, we will email you a Revised Offer. This applies, for example, where the Grade, model, storage, colour, network status, battery health or battery cycle count differs; where the Device arrived after the Quote expired and prices have fallen; or where the Device has non-genuine parts. The Revised Offer will:`,
                items: [
                    ['(a)', `explain each reason for the change by reference to the Condition Grades;`],
                    ['(b)', `include photos (and, where relevant, a diagnostic report) showing the issue; and`],
                    ['(c)', `be calculated from our published price for the model, storage, network status and Grade we found on the day of Inspection, less any deduction set out in these terms.`],
                ],
            },
            { c: '8.2', t: `If your Device is in better condition than you described, we will pay your original Quote.` },
            { c: '8.3', t: `You have 7 days from the date we send the Revised Offer to accept it, reject it, or ask us to re-inspect the Device. Use the link in the email, email support@zephyrtechnology.co.uk, or WhatsApp 07500 990009. We will send you a reminder by email and WhatsApp at least 48 hours before the 7 days end.` },
            { c: '8.4', t: `If you do not reply within the 7 days, we will treat the Revised Offer as accepted and send payment of the Revised Offer amount under clause 15. Please check your spam/junk folder. We are not responsible for messages that do not reach you because of spam filters or incorrect contact details you gave us.` },
            { c: '8.5', t: `Re-inspection: if you dispute our findings within the 7 days, a different technician will re-inspect the Device and send you the outcome with photos (and, if you ask, a short video). The 7-day period restarts from the date of the re-inspection outcome. You may also send us your own dated photos from before posting. We may disregard images that appear to have been edited or manipulated.` },
            { c: '8.6', t: `Returns: if you reject the Revised Offer, we will return the Device to the address on your Order within 5 Business Days by Royal Mail tracked post. Returns are free of charge for all genuine Devices. A return fee to cover postage applies only where the Device is not genuine, for example where it has non-genuine or replaced parts. Counterfeit and cloned Devices are not returned (see clause 12.1). We will tell you the amount of any return fee in our email, and we will not dispatch the Device until it is paid. If you do not pay the fee within 30 days, clause 17 (unclaimed devices) applies.` },
            { c: '8.7', t: `We will only ever make one Revised Offer for each Device after Inspection, apart from any change resulting from a re-inspection under clause 8.5. We will not raise new issues after you have rejected an offer.` },
        ],
    },
    {
        id: 'differ-from-order',
        number: '9',
        title: 'DEVICES THAT DIFFER FROM YOUR ORDER',
        blocks: [
            { c: '9.1', t: `If we receive a different model, storage capacity, colour (where priced differently) or network status from the one you ordered, we will make a Revised Offer based on the Device we actually received, under clause 8.` },
            { c: '9.2', t: `If we receive a make we do not buy, or an item that is not a phone, we will contact you and return it under clause 8.6 or, at your written request, recycle it free of charge.` },
            { c: '9.3', t: `If you send more Devices than are listed on your Order, we will contact you. We will either add them to your Order at our current price (if you agree) or return them under clause 8.6.` },
        ],
    },
    {
        id: 'activation-lock',
        number: '10',
        title: 'ACTIVATION LOCK, ACCOUNTS, PASSCODES AND MDM',
        blocks: [
            {
                c: '10.1',
                t: `Before sending, you must:`,
                items: [
                    ['(a)', `Apple: sign out of your Apple Account/iCloud, turn off Find My iPhone (Activation Lock), and erase all content and settings;`],
                    ['(b)', `Samsung: remove your Samsung account (including Find My Mobile/SmartThings Find) and your Google account so that Factory Reset Protection (FRP) is disabled, then factory reset;`],
                    ['(c)', `remove any screen-lock passcode, PIN, pattern or biometric lock;`],
                    ['(d)', `ensure the Device is not enrolled in any Mobile Device Management (MDM), Device Enrolment Program/Apple Business Manager, Samsung Knox Guard or other corporate or remote-lock service; and`],
                    ['(e)', `remove all SIM cards and memory cards.`],
                ],
            },
            { c: '10.2', t: `If a Device arrives with any of these locks still active, we will pause your Order and email you instructions on how to remove the lock remotely. You will then have 14 days to remove it and tell us. We will re-test the Device. If the lock has been removed, we will continue with Inspection and your Quote (or any Revised Offer) will apply, even if the 14-day Quote period in clause 5 has ended while we waited.` },
            {
                c: '10.3',
                t: `If the lock is still active after 14 days, we will email you again and you may choose to:`,
                items: [
                    ['(a)', `have the Device returned under clause 8.6; or`],
                    ['(b)', `let us recycle the Device responsibly for the amount (if any) we offer in our email.`],
                ],
            },
            { c: '10.4', t: `If you do not reply within 14 days of our second email, we will return the Device to you under clause 8.6. If the return fails, clause 17 applies. We will not recycle a locked Device for no payment without your agreement, except under clause 17.` },
            { c: '10.5', t: `We cannot remove Activation Lock, FRP or MDM ourselves. We will never ask for your Apple, Samsung or Google password. Do not send it to us.` },
            { c: '10.6', t: `If we reasonably suspect that a locked Device is not yours, clause 11 applies instead.` },
        ],
    },
    {
        id: 'flagged-devices',
        number: '11',
        title: 'LOST, STOLEN, BLOCKED, FINANCE AND INSURANCE-FLAGGED DEVICES',
        blocks: [
            { c: '11.1', t: `We check every Device against CheckMEND and other databases used by the UK mobile recycling industry. We follow the Home Office code of practice for mobile phone recyclers, under which every phone offered is checked against the national mobile phone register and details of a phone reported stolen, and of the person trying to sell it, are passed to the police.` },
            {
                c: '11.2',
                t: `If a Device is recorded as lost, stolen, blocked or barred, or is subject to an insurance claim or payout (a "flag"), we will:`,
                items: [
                    ['(a)', `not pay for it, and suspend or cancel the Order;`],
                    ['(b)', `hold the Device in quarantine for 28 days and email you with the flag details and how to contest it (for example, through the database provider or your network/insurer);`],
                    ['(c)', `not return the Device to you while it is flagged; and`],
                    ['(d)', `where the law allows or requires, share your details, the Device and our records with the police, the database provider, the network operator, the insurer or the rightful owner, without further notice to you.`],
                ],
            },
            { c: '11.3', t: `If the flag is cleared within the 28 days and you prove you are the lawful owner, we will continue with your Order at the Quote (or Revised Offer). If it is not cleared, we will deal with the Device as directed by the police or the rightful owner. Where there is no such direction, we will securely recycle it, and no payment will be due.` },
            { c: '11.4', t: `Finance and network "asset watch" flags: if a Device is flagged by a network or lender because finance, a contract or a payment plan is outstanding (but it is not reported lost or stolen), we will not buy it until the flag is cleared. We will hold it for 28 days for you to clear the flag and will pay your Quote once it is cleared. Otherwise we will return it under clause 8.6.` },
            { c: '11.4A', t: `Phones linked to finance or a contract: if a Device is, or may be, linked to a finance agreement, contract or payment plan, we may ask you for photo ID and proof of address before we pay you. This is so that, if the finance, contract or payment plan is not paid off and the Device is later blocked, we can contact you and recover our money under clause 16.` },
            { c: '11.5', t: `If, after we have paid you, we discover that a Device was flagged at the time of sale, or a Device becomes flagged or locked after the sale, clause 16 (Fraud prevention and recovery) applies.` },
        ],
    },
    {
        id: 'counterfeit-tampered',
        number: '12',
        title: 'COUNTERFEIT, TAMPERED, NON-GENUINE, LIQUID-DAMAGED AND INCOMPLETE DEVICES',
        blocks: [
            { c: '12.1', t: `Counterfeit or cloned devices, or devices with an altered IMEI/serial number, will not be paid for or returned. We will hold them and may report them to the police or Trading Standards. Altering a mobile phone's IMEI is a criminal offence under the Mobile Telephones (Re-programming) Act 2002.` },
            { c: '12.2', t: `Non-genuine or replaced parts: if a Device has a non-genuine screen, battery, camera or other part (including where the Device shows an "Unknown Part" or similar message), it cannot be Sealed, Excellent or Good. We will make a Revised Offer at our Broken price or our published deduction. If you reject it, the return fee in clause 8.6 applies.` },
            { c: '12.3', t: `Tampered devices: if a Device shows signs of having been opened or interfered with, it will be graded Broken and a Revised Offer made. Examples are missing or damaged screws, broken seals, adhesive residue, or internal components removed or swapped.` },
            { c: '12.4', t: `Liquid damage: we do not buy liquid-damaged Devices at any Grade. If we find liquid damage (for example, triggered liquid contact indicators or corrosion), we will email you photos of the damage. You can then choose to have the Device returned under clause 8.6 or let us recycle it free of charge. If you do not reply within 14 days, clause 17 applies.` },
            { c: '12.5', t: `Missing parts: if a Device is missing its battery, logic board or other major internal component, it has no value. With your agreement we will recycle it free, or return it under clause 8.6.` },
        ],
    },
    {
        id: 'postage',
        number: '13',
        title: 'POSTAGE, PACKAGING AND RISK IN TRANSIT',
        blocks: [
            { c: '13.1', t: `Postage to us is free. We will email you a prepaid Royal Mail label or QR code. If you ask, we will also send you a free postage bag. Parcels sent with our label are covered up to Royal Mail's compensation limit for the service we use. If your Device is worth more than this, please contact us before sending.` },
            { c: '13.2', t: `Pack the Device securely: wrap it in bubble wrap or similar inside a padded envelope or a small box so it cannot move. Do not send chargers, cables, cases, original boxes (except for Sealed Devices) or other accessories. Sealed Devices must be sent in their original sealed box inside separate outer packaging. Never post the retail box on its own, and never write on it or stick labels on it.` },
            { c: '13.3', t: `Get and keep proof of postage (the Post Office receipt or drop-off confirmation with the tracking number) until you are paid.` },
            { c: '13.4', t: `The Device remains your property and at your risk until it arrives with us. If a parcel sent with our label is lost or damaged in transit, we will make a claim with Royal Mail for you. Provided you have proof of postage, we will pay you the amount Royal Mail pays, up to the lower of your Quote and Royal Mail's compensation limit. Tell us within 30 days of posting if your parcel has not arrived.` },
            { c: '13.5', t: `If you use your own postage method, the Device is at your risk until it reaches us, and we are not responsible for loss or damage in transit.` },
            { c: '13.6', t: `Do not post a Device with a swollen, leaking or visibly damaged battery. Contact us first.` },
            { c: '13.7', t: `We are not responsible for damage caused by inadequate packaging. Where a Device arrives visibly damaged in a damaged parcel, we will photograph it, keep the packaging for at least 14 days, and help you with any Royal Mail claim before we grade the Device.` },
        ],
    },
    {
        id: 'your-data',
        number: '14',
        title: 'YOUR DATA',
        blocks: [
            { c: '14.1', t: `Before sending, you must back up any data you want to keep, sign out of all accounts, and erase the Device (factory reset). Once a Device leaves your possession, we cannot return any data, photos, contacts or files to you.` },
            { c: '14.2', t: `You are responsible for removing your data. We do not access, copy or use data left on a Device, and we are not liable for any data left on it, except where loss or misuse is caused by our own breach of data protection law or our negligence.` },
            { c: '14.3', t: `Your personal data: we use your name, address, contact details, bank or PayPal details and Device identifiers to process your Order, pay you, prevent and investigate fraud and crime, meet our legal and tax obligations, and handle complaints. We process this data in line with UK GDPR and the Data Protection Act 2018. We may share it with our payment provider, Royal Mail, our IMEI-check provider, fraud prevention agencies, the police and other law-enforcement bodies, and HMRC. We keep purchase records for at least six years for VAT and tax purposes, and we keep bank details only as long as we need them for payment, disputes, fraud investigations or tax records. Contact support@zephyrtechnology.co.uk with any questions about how we use your data.` },
            { c: '14.4', t: `We will only send you marketing if you have opted in. You can opt out at any time.` },
        ],
    },
    {
        id: 'payment',
        number: '15',
        title: 'PAYMENT',
        blocks: [
            { c: '15.1', t: `If your Device passes Inspection, or you accept (or are treated as accepting) a Revised Offer, we aim to send payment on the next Business Day after Inspection is completed or the Revised Offer is accepted. If further checks are needed under clause 7.1A, we will send payment once those checks are complete.` },
            { c: '15.2', t: `We pay by UK bank transfer (Faster Payments/BACS) or PayPal. We pay only into an account in your name. We do not pay cash.` },
            { c: '15.3', t: `Bank transfer: we do not charge any fees for bank transfer payments.` },
            { c: '15.4', t: `PayPal: if you choose PayPal, we send your payment as "Goods and Services". PayPal charges the person receiving a Goods and Services payment a fee, which it deducts from the amount you receive. For UK payments this is currently 2.9% + 30p per payment (for example, about £11.90 on a £400 payment). PayPal sets this fee and may change it. The amount you receive will be your Quote or accepted Revised Offer less PayPal's fee. We are not responsible for PayPal's fees, holds or account restrictions. If you do not want to pay this fee, choose bank transfer.` },
            { c: '15.5', t: `Payment times are for when we send the payment. Some banks and building societies take up to 5 Business Days to credit funds. Bank holidays, your bank's own security checks, and payment-provider outages are outside our control.` },
            { c: '15.6', t: `You must give us correct payment details. If a payment fails or is returned because of incorrect details, we will contact you and send payment again within 2 Business Days of receiving correct details. If you gave us incorrect details and the payment reaches someone else's account, we are not liable to pay you again. We will, however, ask our bank or PayPal to try to recover the payment and give you the information you need to help.` },
            { c: '15.7', t: `Tell us about any problem with a payment within 30 days of the date we tell you it was sent.` },
            { c: '15.8', t: `We may delay payment while we carry out ID or ownership checks under clause 16, or investigate a flag under clause 11. We will tell you if this happens.` },
            { c: '15.9', t: `Ownership of the Device passes to us when we send payment to you. If we pay you by mistake (for example, twice, or for a Device later found to be flagged), you must repay the amount.` },
        ],
    },
    {
        id: 'fraud-prevention',
        number: '16',
        title: 'FRAUD PREVENTION AND RECOVERY',
        blocks: [
            { c: '16.1', t: `Identity checks: we may ask you to provide photo ID, proof of address and/or proof of ownership or purchase for any Device, before or after it arrives. Examples of proof of ownership are a receipt, a network or retailer invoice, or an Apple/Samsung account record.` },
            { c: '16.2', t: `If you do not provide what we reasonably ask for within 14 days, we may cancel the Order. We will then return the Device only to the address on your Order under clause 8.6 or, if we suspect it is stolen, deal with it under clause 11.` },
            { c: '16.3', t: `Records: we record the details of every purchase: your name and address, the date and time of purchase, the Device description, its IMEI/serial number, the result of our IMEI check, our inspection photos and your payment details. We do this to meet our VAT margin scheme record-keeping requirements and to help the police prevent the recycling of stolen phones.` },
            {
                c: '16.4',
                t: `What we treat as fraud. Examples include:`,
                items: [
                    ['(a)', `selling us a Device you do not own or have no right to sell;`],
                    ['(b)', `selling us a Device that is lost, stolen, blocked or subject to an insurance claim;`],
                    ['(c)', `giving us false or someone else's identity, contact or payment details;`],
                    ['(d)', `reporting a Device as lost or stolen, or making an insurance claim for it, after you have sold it to us;`],
                    ['(e)', `re-locking a Device after the sale, for example by turning Activation Lock, Find My or FRP back on, or enrolling or locking it through MDM, Samsung Knox Guard or any other remote-lock service;`],
                    ['(f)', `causing a Device to be blocked after the sale, for example by not paying the finance, contract or payment plan linked to it;`],
                    ['(g)', `sending us a counterfeit or cloned Device, or one with an altered IMEI/serial number; and`],
                    ['(h)', `trying to reverse a payment you have received from us, for example through a false PayPal or bank dispute.`],
                ],
            },
            {
                c: '16.5',
                t: `Devices blacklisted or locked after we have paid you: your promises in clause 3.1 continue after we pay you. If, after we have paid you, the Device becomes blacklisted, blocked or barred, is reported lost or stolen, becomes subject to an insurance claim or payout, or is locked by Activation Lock, FRP, Samsung Knox Guard, MDM or any other remote lock, because of anything that happened before the sale or anything done by you or someone acting for you after the sale, you must:`,
                items: [
                    ['(a)', `remove the lock or clear the flag within 7 days of our written request; or`],
                    ['(b)', `repay in full the amount we paid you within 14 days of our written request.`],
                ],
            },
            {
                c: '16.6',
                t: `How we will recover our money: where clause 16.4 or 16.5 applies, we will do everything reasonably possible to recover the money we paid you and any loss we suffer, including:`,
                items: [
                    ['(a)', `reporting the matter to the police and the UK's national fraud reporting service, and cooperating fully with any investigation;`],
                    ['(b)', `giving the police and other authorities our records, including your ID, contact and payment details, the IMEI/serial number, our purchase record, inspection photos, messages and any IP address and device data we hold;`],
                    ['(c)', `contacting the network, insurer, lender, database provider or device manufacturer to dispute or clear the flag or lock;`],
                    ['(d)', `where the law allows, sharing information with fraud prevention agencies and other phone recyclers to prevent further fraud;`],
                    ['(e)', `raising disputes with PayPal or your bank where a payment was obtained by fraud; and`],
                    ['(f)', `taking legal action, including a claim in the County Court, to recover the amount we paid you, our reasonable costs and interest.`],
                ],
            },
            { c: '16.7', t: `Your promise to us (indemnity): if any of the statements you make in clause 3.1 is untrue, or clause 16.4 or 16.5 applies, you will compensate us for the losses, costs and claims we reasonably suffer as a result. Examples include the amount we paid you, the value of a Device we must hand to its rightful owner, and reasonable costs of dealing with the police, third parties and recovery action.` },
            { c: '16.8', t: `Nothing in this clause limits any other rights we have under these terms or the law.` },
        ],
    },
    {
        id: 'unclaimed-devices',
        number: '17',
        title: 'UNCLAIMED DEVICES',
        blocks: [
            {
                c: '17.1',
                t: `A Device is "unclaimed" if:`,
                items: [
                    ['(a)', `we cannot return it because the address you gave is wrong or nobody accepts delivery after two attempts;`],
                    ['(b)', `you have not paid a return fee within 30 days; or`],
                    ['(c)', `you have not replied to us about a locked, flagged or liquid-damaged Device within the periods in clauses 10, 11 or 12.`],
                ],
            },
            { c: '17.2', t: `We will hold an unclaimed Device for 90 days from our last email to you. During that time you can collect it by arrangement or arrange its return. After 90 days, and after one final email reminder at least 14 days before the deadline, we may treat the Device as abandoned. We will then securely erase and recycle it, and we will pay you any value we have offered for it (if any) after deducting our reasonable storage costs.` },
        ],
    },
    {
        id: 'cancelling',
        number: '18',
        title: 'CANCELLING YOUR ORDER',
        blocks: [
            { c: '18.1', t: `You can cancel your Order free of charge at any time before you send the Device, by emailing or WhatsApping us. You do not need to give a reason.` },
            { c: '18.2', t: `Once you have sent the Device, you can still cancel before we complete Inspection. We will return the Device under clause 8.6. You can also reject any Revised Offer under clause 8.` },
            { c: '18.3', t: `Once your Device has passed Inspection at your Quote, or you have accepted a Revised Offer, the sale is final and the Device cannot be returned.` },
        ],
    },
    {
        id: 'sim-accessories',
        number: '19',
        title: 'SIM CARDS, MEMORY CARDS AND ACCESSORIES',
        blocks: [
            { c: '19.1', t: `Remove all SIM and memory cards before sending. We will destroy any SIM or memory card we receive and cannot return it. You remain responsible for any airtime contract and for any charges on a SIM, so please cancel or transfer your contract with your network.` },
            { c: '19.2', t: `Do not send accessories, chargers, cases or boxes (except for Sealed Devices). We do not pay for them and we will not return them. They will be recycled.` },
        ],
    },
    {
        id: 'price-changes',
        number: '20',
        title: 'PRICE CHANGES AND OUR RIGHT TO REFUSE',
        blocks: [
            { c: '20.1', t: `Our prices change regularly with the market. The price that applies to you is your Quote (clause 5) or any Revised Offer (clause 8).` },
            { c: '20.2', t: `If a price is obviously wrong because of a technical or typing error, we will tell you as soon as we notice. You can then accept the correct price or have the Device returned free of charge.` },
            { c: '20.3', t: `We may stop buying a model at any time, but we will honour valid Quotes already issued.` },
        ],
    },
    {
        id: 'liability',
        number: '21',
        title: 'OUR LIABILITY TO YOU',
        blocks: [
            { c: '21.1', t: `If we fail to comply with these terms, we are responsible for loss or damage you suffer that is a foreseeable result of our breach or our negligence.` },
            { c: '21.2', t: `Our total liability to you for any Device is limited to the greater of the Quote and any accepted Revised Offer for that Device. This limit does not apply to anything listed in clause 21.4.` },
            {
                c: '21.3',
                t: `We are not responsible for:`,
                items: [
                    ['(a)', `data you leave on a Device (clause 14.2);`],
                    ['(b)', `SIM, airtime or contract charges (clause 19);`],
                    ['(c)', `accessories you send us (clause 19.2);`],
                    ['(d)', `PayPal's fees, holds or account restrictions (clause 15.4);`],
                    ['(e)', `delays caused by events outside our reasonable control, such as postal disruption, bank or payment-system failures, or severe weather; or`],
                    ['(f)', `business losses, where you are selling as a business.`],
                ],
            },
            { c: '21.4', t: `Nothing in these terms limits or excludes our liability for death or personal injury caused by our negligence, for fraud or fraudulent misrepresentation, or for anything else that cannot be limited or excluded by law. Nothing affects your statutory rights.` },
        ],
    },
    {
        id: 'complaints',
        number: '22',
        title: 'COMPLAINTS',
        blocks: [
            { c: '22.1', t: `If you are unhappy, email support@zephyrtechnology.co.uk with your Order number. We aim to resolve complaints within 72 hours.` },
        ],
    },
    {
        id: 'general',
        number: '23',
        title: 'GENERAL',
        blocks: [
            { c: '23.1', t: `If a court finds part of these terms unenforceable, the rest will still apply.` },
            { c: '23.2', t: `Only you and we have rights under these terms. You may not transfer your rights under them without our written consent.` },
            { c: '23.3', t: `If we delay enforcing a term, we can still enforce it later.` },
            { c: '23.4', t: `These terms are governed by the law of England and Wales. You can bring proceedings in the courts of England and Wales. If you live in Scotland or Northern Ireland, you can also bring proceedings in your local courts.` },
            { c: '23.5', t: `VAT: we buy Devices for resale under the VAT margin scheme for second-hand goods. Our purchase record will show your name and address, the Device description, the date and the price paid. We do not issue VAT invoices to sellers.` },
        ],
    },
];

const LetteredList = ({ items }) => (
    <ul className="space-y-3 pt-1">
        {items.map(([label, text]) => (
            <li key={label} className="flex gap-3">
                <span className="min-w-[1.75rem] font-semibold text-[#5D6879]">{label}</span>
                <span>{text}</span>
            </li>
        ))}
    </ul>
);

const formatNumber = (number) => (number ? number.padStart(2, '0') : '');

const renderBlock = (block, idx) => {
    if (block.p) return <p key={idx}>{block.p}</p>;

    if (block.strong) {
        return (
            <p key={idx} className="pt-2 font-semibold text-[#5D6879]">
                {block.strong}
            </p>
        );
    }

    if (block.grade) {
        return (
            <div key={idx} className="space-y-4">
                <p className="pt-2 font-semibold text-[#5D6879]">{block.grade}</p>
                {block.intro ? <p>{block.intro}</p> : null}
                <ul className="space-y-3 pt-1">
                    {block.bullets.map((bullet, i) => (
                        <li key={i} className="flex gap-3">
                            <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-custom" />
                            <span>{bullet}</span>
                        </li>
                    ))}
                </ul>
                {block.after ? <p>{block.after}</p> : null}
            </div>
        );
    }

    if (block.lead) {
        return (
            <div key={idx} className="space-y-4">
                <p className="pt-2 font-semibold text-[#5D6879]">{block.lead}</p>
                <LetteredList items={block.items} />
            </div>
        );
    }

    if (block.defs) {
        return (
            <dl key={idx} className="space-y-3">
                {block.defs.map(([term, text]) => (
                    <div key={term}>
                        <dt className="inline font-semibold text-[#5D6879]">{term}:</dt>{' '}
                        <dd className="inline">{text}</dd>
                    </div>
                ))}
            </dl>
        );
    }

    if (block.c) {
        return (
            <div key={idx} className="flex gap-3">
                <span className="min-w-[2.75rem] font-semibold text-[#5D6879]">{block.c}</span>
                <div className="min-w-0 flex-1 space-y-4">
                    <p>{block.t}</p>
                    {block.items ? <LetteredList items={block.items} /> : null}
                    {block.after ? <p>{block.after}</p> : null}
                </div>
            </div>
        );
    }

    return null;
};

const SellTerms = () => {
    return (
        <div className="bg-[#FBFDFF] min-h-screen [font-variant-ligatures:none] [font-feature-settings:'liga'_0,'calt'_0]">
            <section className="relative overflow-hidden border-b border-[#DDEEF3] bg-[linear-gradient(180deg,#EAF7FA_0%,#F7FCFD_42%,#FBFDFF_100%)]">
                <div className="absolute inset-0 pointer-events-none">
                    <div className="absolute left-1/2 top-10 h-56 w-56 -translate-x-1/2 rounded-full bg-[#88EDFC]/15 blur-3xl" />
                    <div className="absolute -left-16 top-24 h-56 w-56 rounded-full bg-white/70 blur-3xl" />
                </div>

                <Container>
                    <div className="relative mx-auto flex max-w-6xl flex-col items-center px-2 py-16 text-center sm:py-20 lg:py-24">
                        <span className="inline-flex items-center rounded-full border border-[#D4EEF4] bg-white/70 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.26em] text-[#7F9CAC] backdrop-blur">
                            Legal
                        </span>

                        <h1 className="mt-4 text-4xl font-semibold tracking-tight text-[#4E5A79] sm:text-5xl lg:text-6xl">
                            ZEPHYR TECHNOLOGY – SELL YOUR PHONE TERMS AND CONDITIONS
                        </h1>

                        <p className="mt-4 max-w-3xl text-sm leading-6 text-[#7F8897] sm:text-base">
                            Zephyr Corp Ltd · zephyrtechnology.co.uk · support@zephyrtechnology.co.uk · WhatsApp 07500 990009
                        </p>

                        <div className="mt-3 flex flex-wrap items-center justify-center gap-3 text-xs text-[#7F8897] sm:text-sm">
                            <span className="inline-flex items-center gap-2 rounded-full border border-[#DCE8EE] bg-white/70 px-4 py-2 shadow-sm backdrop-blur">
                                <Smartphone className="h-4 w-4 text-custom" />
                                Sell Your Phone
                            </span>
                            <span className="inline-flex items-center gap-2 rounded-full border border-[#DCE8EE] bg-white/70 px-4 py-2 shadow-sm backdrop-blur">
                                <FileText className="h-4 w-4 text-custom" />
                                Terms and Conditions
                            </span>
                        </div>
                    </div>
                </Container>
            </section>

            <Container>
                <div className="grid gap-6 py-8 lg:grid-cols-[220px_minmax(0,1fr)] lg:gap-8 lg:py-12">
                    <aside className="hidden lg:block">
                        <div className="sticky top-24 max-h-[calc(100vh-7rem)] overflow-y-auto overscroll-contain [scrollbar-width:thin] rounded-2xl border border-[#E4EDF1] bg-white/80 py-5 pl-5 pr-2 shadow-[0_12px_30px_rgba(23,28,30,0.04)] backdrop-blur">
                            <p className="text-[11px] font-semibold uppercase tracking-[0.24em] text-[#8A93A6]">
                                Contents
                            </p>

                            <nav className="mt-4 space-y-1.5">
                                {sections.map((item) => (
                                    <a
                                        key={item.id}
                                        href={`#${item.id}`}
                                        className="group flex items-start gap-2 rounded-lg px-2 py-1.5 text-sm text-[#6F7A8F] transition-colors hover:bg-[#F6FAFB] hover:text-[#4E5A79]"
                                    >
                                        <span className="mt-0.5 min-w-[1.6rem] text-[11px] font-semibold tracking-[0.18em] text-[#9DA7B6] group-hover:text-custom">
                                            {formatNumber(item.number)}
                                        </span>
                                        <span className="leading-5 font-medium">{item.title}</span>
                                    </a>
                                ))}
                            </nav>
                        </div>
                    </aside>

                    <main className="min-w-0">
                        <div className="space-y-6 lg:space-y-8">
                            <div className="rounded-2xl border border-[#ECF1F4] bg-white/80 p-6 text-sm leading-7 text-[#798495] shadow-[0_10px_30px_rgba(23,28,30,0.03)] backdrop-blur sm:p-7 sm:text-[15px]">
                                <p>{introText}</p>
                            </div>

                            {sections.map((section) => (
                                <section
                                    key={section.id}
                                    id={section.id}
                                    className="scroll-mt-24 rounded-2xl border border-[#ECF1F4] bg-white/80 p-6 shadow-[0_10px_30px_rgba(23,28,30,0.03)] backdrop-blur sm:p-7"
                                >
                                    <div className="flex items-start gap-3">
                                        {section.number ? (
                                            <div className="pt-1 text-[11px] font-semibold tracking-[0.28em] text-[#B9C4D2]">
                                                {formatNumber(section.number)}
                                            </div>
                                        ) : null}

                                        <div className="min-w-0 flex-1">
                                            <div className="flex items-center gap-3">
                                                <h2 className="text-2xl font-semibold tracking-tight text-[#4E5A79] sm:text-[1.8rem]">
                                                    {section.title}
                                                </h2>
                                                <span className="hidden h-px flex-1 bg-[#E6EEF2] sm:block" />
                                            </div>

                                            <div className="mt-5 space-y-4 text-sm leading-7 text-[#798495] sm:text-[15px]">
                                                {section.blocks.map(renderBlock)}
                                            </div>
                                        </div>
                                    </div>
                                </section>
                            ))}
                        </div>
                    </main>
                </div>
            </Container>
        </div>
    );
};

export default SellTerms;
