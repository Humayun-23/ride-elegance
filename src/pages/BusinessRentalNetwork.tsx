import { useState } from "react";
import { Helmet } from "react-helmet-async";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import {
  Building2, Bed, Map, CalendarDays, Briefcase, Stethoscope, HardHat, GraduationCap,
  PhoneCall, UserX, Clock, CarFront, AlertCircle, Receipt,
  Send, Search, CheckCircle2, Car, ShieldCheck, Store, MessageCircle, Handshake,
  Check, ArrowRight
} from "lucide-react";
import { toast } from "sonner"; // Assuming sonner is used based on package.json

const WHATSAPP_NUMBER = import.meta.env.VITE_WHATSAPP_NUMBER || "918638578854";
const WHATSAPP_URL = `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent("Hi GoPanda, I'm interested in the Business Rental Network pilot.")}`;

export default function BusinessRentalNetwork() {
  const scrollToPilot = () => {
    document.getElementById("pilot-program")?.scrollIntoView({ behavior: "smooth" });
  };

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    toast.success("Request received! We will contact you shortly.");
  };

  return (
    <>
      <Helmet>
        <title>Business Vehicle Rentals in Guwahati | GoPanda Business Rental Network</title>
        <meta name="description" content="GoPanda Business Rental Network helps businesses in Guwahati arrange rental vehicles through verified local rental partners. One request, one point of contact, faster coordination." />
        <meta name="keywords" content="business vehicle rental guwahati, corporate car rental guwahati, rental cars for business guwahati, vehicle rental for hotels, event vehicle rental guwahati, business mobility guwahati, GoPanda for business" />
      </Helmet>

      <div className="min-h-screen bg-slate-50 pt-24 pb-16">
        {/* Hero Section */}
        <section className="relative overflow-hidden px-4 py-16 sm:px-6 lg:px-8 max-w-7xl mx-auto text-center">
          <div className="absolute inset-0 -z-10 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-primary/10 via-slate-50 to-slate-50"></div>

          <div className="inline-flex items-center rounded-full border border-primary/20 bg-primary/5 px-3 py-1 text-sm font-medium text-primary mb-8">
            <span className="flex h-2 w-2 rounded-full bg-primary mr-2 animate-pulse"></span>
            Pilot now open in Guwahati
          </div>

          <h1 className="mx-auto max-w-4xl font-display text-4xl font-bold tracking-tight text-slate-900 sm:text-6xl mb-6">
            One vehicle requirement. <br className="hidden sm:block" />
            <span className="text-primary">Multiple verified partners.</span> <br className="hidden sm:block" />
            One confirmation.
          </h1>

          <p className="mx-auto max-w-2xl text-lg leading-8 text-slate-600 mb-10">
            GoPanda helps hotels, offices, travel agencies, events, hospitals, and local businesses arrange rental vehicles without calling multiple providers. Send us your requirement, and we coordinate with verified local rental partners.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Button size="lg" onClick={scrollToPilot} className="h-14 px-8 rounded-full text-base font-semibold glow bg-gradient-to-r from-[hsl(var(--primary))] to-[hsl(var(--primary-glow))] text-white border-0 hover:scale-105 transition-all w-full sm:w-auto">
              Join Business Pilot
            </Button>
            <Button size="lg" variant="outline" onClick={() => window.open(WHATSAPP_URL, "_blank")} className="h-14 px-8 rounded-full text-base font-semibold border-slate-200 hover:bg-slate-100 w-full sm:w-auto">
              <MessageCircle className="mr-2 h-5 w-5 text-green-600" />
              WhatsApp Us
            </Button>
          </div>

          {/* Hero Visual Concept */}
          <div className="mt-16 mx-auto max-w-4xl rounded-2xl bg-white p-4 sm:p-8 shadow-xl border border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex flex-col items-center p-4 bg-slate-50 rounded-xl w-full sm:w-1/4">
              <Briefcase className="h-8 w-8 text-slate-700 mb-2" />
              <span className="text-sm font-semibold text-slate-900">Your Business</span>
            </div>
            <ArrowRight className="hidden sm:block h-6 w-6 text-slate-300" />
            <div className="flex flex-col items-center p-4 bg-primary/10 rounded-xl w-full sm:w-1/4 ring-2 ring-primary/20">
              <img src="/logo.png" alt="GoPanda" className="h-8 object-contain mb-2" />
              <span className="text-sm font-semibold text-primary">GoPanda Network</span>
            </div>
            <ArrowRight className="hidden sm:block h-6 w-6 text-slate-300" />
            <div className="flex flex-col items-center p-4 bg-slate-50 rounded-xl w-full sm:w-1/4">
              <Store className="h-8 w-8 text-slate-700 mb-2" />
              <span className="text-sm font-semibold text-slate-900 text-center">Verified Partners</span>
            </div>
            <ArrowRight className="hidden sm:block h-6 w-6 text-slate-300" />
            <div className="flex flex-col items-center p-4 bg-green-50 rounded-xl w-full sm:w-1/4 border border-green-100">
              <CheckCircle2 className="h-8 w-8 text-green-600 mb-2" />
              <span className="text-sm font-semibold text-green-700 text-center">Confirmed Vehicle</span>
            </div>
          </div>
        </section>

        {/* Trust Strip */}
        <section className="border-y border-slate-200 bg-white py-8">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex flex-wrap justify-center gap-x-8 gap-y-6 sm:gap-x-12 text-center text-sm font-medium text-slate-600">
              <div className="flex items-center gap-2"><ShieldCheck className="h-5 w-5 text-primary" /> Verified local rental partners</div>
              <div className="flex items-center gap-2"><Store className="h-5 w-5 text-primary" /> 5 rental shops onboard</div>
              <div className="flex items-center gap-2"><Car className="h-5 w-5 text-primary" /> 17 vehicles available in Guwahati</div>
              <div className="flex items-center gap-2"><MessageCircle className="h-5 w-5 text-primary" /> WhatsApp-first coordination</div>
              <div className="flex items-center gap-2"><Handshake className="h-5 w-5 text-primary" /> Building with local businesses</div>
            </div>
          </div>
        </section>

        {/* Who Is This For */}
        <section className="py-20 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="font-display text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl mb-4">Built for businesses that occasionally need rental vehicles</h2>
            <p className="text-lg text-slate-600 max-w-2xl mx-auto">No matter your industry, if you need vehicles, we can coordinate them.</p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              { icon: Bed, title: "Hotels", desc: "Guest rentals, airport pickups, local travel" },
              { icon: Building2, title: "Hostels", desc: "Group bookings and backpacker rentals" },
              { icon: Map, title: "Travel Agencies", desc: "Vehicles for tour packages and clients" },
              { icon: CalendarDays, title: "Event Companies", desc: "Crew movement and guest transport" },
              { icon: Briefcase, title: "Offices & SMEs", desc: "Employee travel, client and site visits" },
              { icon: Stethoscope, title: "Hospitals & Clinics", desc: "Staff mobility and visiting doctors" },
              { icon: HardHat, title: "Construction", desc: "Site team transport and inspections" },
              { icon: GraduationCap, title: "Educational Inst.", desc: "Guest lecturers and event mobility" },
            ].map((item, i) => (
              <Card key={i} className="bg-white border-slate-200 shadow-sm hover:shadow-md transition-shadow">
                <CardContent className="p-6 flex flex-col items-start text-left">
                  <div className="p-3 bg-primary/10 rounded-xl text-primary mb-4">
                    <item.icon className="h-6 w-6" />
                  </div>
                  <h3 className="font-bold text-slate-900 mb-1">{item.title}</h3>
                  <p className="text-sm text-slate-500">{item.desc}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </section>

        {/* The Problem */}
        <section className="py-20 bg-white">
          <div className="px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
            <div className="text-center mb-12">
              <h2 className="font-display text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl mb-4">Still arranging rentals manually?</h2>
              <p className="text-lg text-slate-600 max-w-2xl mx-auto">The traditional way of finding vehicles takes time and effort.</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[
                { icon: PhoneCall, title: "Calling multiple providers", desc: "Wasting time checking who has availability." },
                { icon: UserX, title: "Regular vendor unavailable", desc: "Scrambling when your usual contact is fully booked." },
                { icon: Clock, title: "Last-minute requirements", desc: "Struggling to find vehicles on short notice." },
                { icon: CarFront, title: "Need multiple vehicles", desc: "One vendor rarely has enough vehicles for big groups." },
                { icon: AlertCircle, title: "No single backup option", desc: "Starting the search from scratch every time." },
                { icon: Receipt, title: "Messy reimbursement records", desc: "Collecting bills from different unverified sources." },
              ].map((item, i) => (
                <div key={i} className="flex gap-4 p-6 rounded-2xl bg-slate-50 border border-slate-100">
                  <div className="flex-shrink-0 mt-1">
                    <item.icon className="h-6 w-6 text-rose-500" />
                  </div>
                  <div>
                    <h3 className="font-bold text-slate-900">{item.title}</h3>
                    <p className="text-sm text-slate-500 mt-1">{item.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* How It Works */}
        <section className="py-20 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="font-display text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl mb-4">Simple workflow for businesses</h2>
            <div className="inline-block bg-amber-50 border border-amber-200 text-amber-800 rounded-lg px-4 py-3 mt-4 text-left max-w-2xl font-medium">
              <span className="block text-amber-900 font-bold mb-1">Important:</span>
              You do not need to replace your current vendor. Use GoPanda as a backup mobility partner whenever you need extra vehicles or faster availability.
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-8 relative">
            <div className="hidden md:block absolute top-12 left-[10%] right-[10%] h-0.5 bg-slate-200 -z-10"></div>

            {[
              { icon: Send, title: "1. Send requirement", desc: "Vehicle type, quantity, date, pickup location, and duration." },
              { icon: Search, title: "2. We check partners", desc: "We coordinate with local rental shops that match your requirement." },
              { icon: CheckCircle2, title: "3. One confirmed option", desc: "You receive one clear response instead of managing multiple vendors." },
              { icon: Car, title: "4. Complete booking", desc: "We support coordination till the trip is completed." },
            ].map((step, i) => (
              <div key={i} className="flex flex-col items-center text-center">
                <div className="w-24 h-24 rounded-full bg-white border-4 border-slate-50 shadow-md flex items-center justify-center mb-6">
                  <step.icon className="h-10 w-10 text-primary" />
                </div>
                <h3 className="font-bold text-xl text-slate-900 mb-2">{step.title}</h3>
                <p className="text-slate-600">{step.desc}</p>
              </div>
            ))}
          </div>
        </section>

        {/* Already Have a Rental Vendor? */}
        <section className="py-20 bg-slate-900 text-slate-50">
          <div className="px-4 sm:px-6 lg:px-8 max-w-5xl mx-auto text-center">
            <h2 className="font-display text-3xl font-bold tracking-tight text-white sm:text-4xl mb-6">Already have a trusted rental vendor? Perfect.</h2>
            <p className="text-lg text-slate-300 max-w-3xl mx-auto mb-10">
              GoPanda is not asking you to replace them. We work as your backup rental network whenever your regular provider is unavailable, fully booked, or unable to provide enough vehicles.
            </p>

            <div className="flex flex-wrap justify-center gap-4 mb-12 text-left">
              {[
                "Keep your current vendor",
                "Use GoPanda when you need backup",
                "Helpful for urgent or extra requirements",
                "Useful when you need multiple vehicle options",
                "One point of contact for coordination"
              ].map((bullet, i) => (
                <div key={i} className="flex items-center gap-2 bg-slate-800/50 rounded-full px-4 py-2 border border-slate-700">
                  <Check className="h-4 w-4 text-green-400" />
                  <span className="text-sm font-medium text-slate-200">{bullet}</span>
                </div>
              ))}
            </div>

            <Button size="lg" onClick={scrollToPilot} className="h-14 px-8 rounded-full text-base font-semibold glow bg-primary text-white border-0 hover:scale-105 transition-all">
              Try GoPanda Once
            </Button>
          </div>
        </section>

        {/* For Rental Shop Owners */}
        <section className="py-20 bg-white">
          <div className="px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
            <div className="flex flex-col lg:flex-row gap-12 items-center">
              <div className="lg:w-1/2">
                <div className="inline-flex items-center rounded-full border border-primary/20 bg-primary/5 px-3 py-1 text-sm font-medium text-primary mb-6">
                  For Rental Partners
                </div>
                <h2 className="font-display text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl mb-6">
                  Turn idle vehicles into extra business opportunities
                </h2>
                <p className="text-lg text-slate-600 mb-6">
                  GoPanda is building a business rental network. When hotels, companies, events, and local businesses need vehicles, we share relevant enquiries with verified rental partners.
                </p>
                <div className="bg-primary/5 border border-primary/20 rounded-xl p-5 mb-8">
                  <p className="text-primary font-medium">
                    We are not asking you to reduce your normal rates or block your full inventory. You stay in control. You choose which vehicles to offer, your minimum price, and which requests to accept.
                  </p>
                </div>
                <ul className="space-y-3 mb-8">
                  {[
                    "Extra business enquiries",
                    "Monetize idle vehicles",
                    "Keep your direct customers",
                    "Accept only the requests you want",
                    "Set your own minimum price",
                    "Get access to business demand"
                  ].map((item, i) => (
                    <li key={i} className="flex items-center gap-3">
                      <div className="flex-shrink-0 h-5 w-5 rounded-full bg-green-100 flex items-center justify-center">
                        <Check className="h-3 w-3 text-green-600" />
                      </div>
                      <span className="text-slate-700">{item}</span>
                    </li>
                  ))}
                </ul>
                <Button size="lg" onClick={() => {
                  document.getElementById("pilot-program")?.scrollIntoView({ behavior: "smooth" });
                  // Focus the shops tab after scrolling if possible (handled natively by user clicking tab)
                }} className="h-12 px-8 rounded-full text-base font-semibold border-2 border-primary text-primary hover:bg-primary/5 bg-transparent w-full sm:w-auto">
                  Join as Rental Partner
                </Button>
              </div>
              <div className="lg:w-1/2 relative">
                <div className="absolute inset-0 bg-gradient-to-tr from-primary/20 to-transparent rounded-3xl transform rotate-3 scale-105 -z-10"></div>
                <img
                  src="https://images.unsplash.com/photo-1560179707-f14e90ef3623?auto=format&fit=crop&q=80&w=1000"
                  alt="Rental Shop Owner"
                  className="rounded-3xl shadow-xl object-cover h-[500px] w-full"
                />
              </div>
            </div>
          </div>
        </section>

        {/* Business Records Coming Soon */}
        <section className="py-20 bg-slate-50 border-t border-slate-200">
          <div className="px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
            <div className="text-center mb-12">
              <h2 className="font-display text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl mb-4">Business-friendly records are coming</h2>
              <p className="text-lg text-slate-600 max-w-2xl mx-auto">
                Many businesses do not only need vehicles. They also need proper receipts, reimbursement records, GST invoices, monthly summaries, and employee-wise booking history. We are exploring these features with early business partners.
              </p>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              {[
                "GST invoices",
                "Monthly statements",
                "Employee-wise booking history",
                "Department/project tagging",
                "Reimbursement-ready summaries",
                "Approval workflow"
              ].map((item, i) => (
                <div key={i} className="bg-white border border-slate-200 p-5 rounded-xl shadow-sm text-center relative overflow-hidden group">
                  <div className="absolute top-0 right-0 bg-primary text-white text-[10px] font-bold px-2 py-0.5 rounded-bl-lg">
                    Coming Soon
                  </div>
                  <span className="font-medium text-slate-700">{item}</span>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Pilot Program */}
        <section id="pilot-program" className="py-24 bg-white scroll-mt-20 border-t border-slate-200">
          <div className="px-4 sm:px-6 lg:px-8 max-w-3xl mx-auto">
            <div className="text-center mb-10">
              <h2 className="font-display text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl mb-4">Join the Guwahati pilot</h2>
              <p className="text-lg text-slate-600">
                We are onboarding a limited number of businesses and rental partners in Guwahati to test this workflow in the real world. Early partners will help shape how GoPanda Business Rental Network evolves.
              </p>
            </div>

            <Card className="shadow-lg border-slate-200">
              <Tabs defaultValue="businesses" className="w-full">
                <TabsList className="w-full grid grid-cols-2 p-1 bg-slate-100 rounded-t-xl rounded-b-none border-b h-auto">
                  <TabsTrigger value="businesses" className="py-3 text-sm font-semibold data-[state=active]:bg-white data-[state=active]:text-primary data-[state=active]:shadow-sm rounded-lg">
                    For Businesses
                  </TabsTrigger>
                  <TabsTrigger value="shops" className="py-3 text-sm font-semibold data-[state=active]:bg-white data-[state=active]:text-primary data-[state=active]:shadow-sm rounded-lg">
                    For Rental Shops
                  </TabsTrigger>
                </TabsList>

                <TabsContent value="businesses" className="p-6 m-0">
                  <form onSubmit={handleFormSubmit} className="space-y-5">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                      <div className="space-y-2">
                        <Label htmlFor="businessName">Business Name</Label>
                        <Input id="businessName" required placeholder="e.g. Skyline Hotels" />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="contactPerson">Contact Person</Label>
                        <Input id="contactPerson" required placeholder="Your name" />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="b-phone">Phone Number</Label>
                        <Input id="b-phone" type="tel" required placeholder="10-digit mobile number" />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="b-email">Email Address</Label>
                        <Input id="b-email" type="email" required placeholder="you@company.com" />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="businessType">Business Type</Label>
                      <Input id="businessType" required placeholder="e.g. Hotel, Event Agency, IT Office" />
                    </div>

                    <div className="space-y-3 pt-2">
                      <Label className="text-base font-semibold">How often do you need rental vehicles?</Label>
                      <RadioGroup defaultValue="rarely" className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        <div className="flex items-center space-x-2 border border-slate-200 p-3 rounded-lg hover:bg-slate-50 cursor-pointer has-[:checked]:border-primary has-[:checked]:bg-primary/5">
                          <RadioGroupItem value="rarely" id="r1" />
                          <Label htmlFor="r1" className="cursor-pointer font-normal flex-1">Rarely (Backup only)</Label>
                        </div>
                        <div className="flex items-center space-x-2 border border-slate-200 p-3 rounded-lg hover:bg-slate-50 cursor-pointer has-[:checked]:border-primary has-[:checked]:bg-primary/5">
                          <RadioGroupItem value="1-5" id="r2" />
                          <Label htmlFor="r2" className="cursor-pointer font-normal flex-1">1–5 times / month</Label>
                        </div>
                        <div className="flex items-center space-x-2 border border-slate-200 p-3 rounded-lg hover:bg-slate-50 cursor-pointer has-[:checked]:border-primary has-[:checked]:bg-primary/5">
                          <RadioGroupItem value="5-20" id="r3" />
                          <Label htmlFor="r3" className="cursor-pointer font-normal flex-1">5–20 times / month</Label>
                        </div>
                        <div className="flex items-center space-x-2 border border-slate-200 p-3 rounded-lg hover:bg-slate-50 cursor-pointer has-[:checked]:border-primary has-[:checked]:bg-primary/5">
                          <RadioGroupItem value="20+" id="r4" />
                          <Label htmlFor="r4" className="cursor-pointer font-normal flex-1">20+ times / month</Label>
                        </div>
                      </RadioGroup>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="currentProcess">Current rental process (Who do you usually call?)</Label>
                      <Input id="currentProcess" placeholder="e.g. We call local taxis or a specific vendor" />
                    </div>

                    <div className="space-y-2 pb-2">
                      <Label htmlFor="mainChallenge">Main challenge with current process</Label>
                      <Textarea id="mainChallenge" placeholder="e.g. Unavailability during peak season, lack of proper bills" className="resize-none" rows={3} />
                    </div>

                    <Button type="submit" className="w-full h-12 text-base font-semibold rounded-xl glow bg-gradient-to-r from-[hsl(var(--primary))] to-[hsl(var(--primary-glow))] text-white">
                      Request Pilot Access
                    </Button>
                  </form>
                </TabsContent>

                <TabsContent value="shops" className="p-6 m-0">
                  <form onSubmit={handleFormSubmit} className="space-y-5">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                      <div className="space-y-2">
                        <Label htmlFor="shopName">Shop Name</Label>
                        <Input id="shopName" required placeholder="Your rental business name" />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="ownerName">Owner Name</Label>
                        <Input id="ownerName" required placeholder="Your name" />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="s-phone">Phone Number</Label>
                        <Input id="s-phone" type="tel" required placeholder="10-digit mobile number" />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="location">Location / Area</Label>
                        <Input id="location" required placeholder="e.g. GS Road, Six Mile" />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                      <div className="space-y-2">
                        <Label htmlFor="numVehicles">Number of vehicles</Label>
                        <Input id="numVehicles" type="number" required placeholder="e.g. 10" min={1} />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="vehicleCategories">Vehicle categories</Label>
                        <Input id="vehicleCategories" required placeholder="e.g. Hatchbacks, Scooters, SUVs" />
                      </div>
                    </div>

                    <div className="space-y-3 pt-2">
                      <Label className="text-base font-semibold">Do you want business enquiries?</Label>
                      <RadioGroup defaultValue="yes" className="flex gap-4">
                        <div className="flex items-center space-x-2">
                          <RadioGroupItem value="yes" id="s-yes" />
                          <Label htmlFor="s-yes" className="cursor-pointer">Yes, send me leads</Label>
                        </div>
                        <div className="flex items-center space-x-2">
                          <RadioGroupItem value="maybe" id="s-maybe" />
                          <Label htmlFor="s-maybe" className="cursor-pointer">I want to learn more first</Label>
                        </div>
                      </RadioGroup>
                    </div>

                    <div className="space-y-2 pb-2">
                      <Label htmlFor="notes">Any questions or notes?</Label>
                      <Textarea id="notes" placeholder="Tell us anything else we should know" className="resize-none" rows={3} />
                    </div>

                    <Button type="submit" className="w-full h-12 text-base font-semibold rounded-xl glow bg-gradient-to-r from-[hsl(var(--primary))] to-[hsl(var(--primary-glow))] text-white">
                      Join Rental Partner Network
                    </Button>
                  </form>
                </TabsContent>
              </Tabs>
            </Card>
          </div>
        </section>

        {/* FAQ Section */}
        <section className="py-20 bg-slate-50 border-t border-slate-200">
          <div className="px-4 sm:px-6 lg:px-8 max-w-3xl mx-auto">
            <h2 className="font-display text-3xl font-bold tracking-tight text-slate-900 text-center mb-10">Frequently Asked Questions</h2>

            <Accordion type="single" collapsible className="w-full space-y-4">
              <AccordionItem value="item-1" className="bg-white border border-slate-200 rounded-lg px-4 data-[state=open]:shadow-sm">
                <AccordionTrigger className="text-left font-semibold hover:no-underline py-4">
                  Do I need to replace my current rental vendor?
                </AccordionTrigger>
                <AccordionContent className="text-slate-600 pb-4">
                  No. GoPanda can work as a backup mobility partner. We step in when your regular vendor is fully booked or unavailable.
                </AccordionContent>
              </AccordionItem>

              <AccordionItem value="item-2" className="bg-white border border-slate-200 rounded-lg px-4 data-[state=open]:shadow-sm">
                <AccordionTrigger className="text-left font-semibold hover:no-underline py-4">
                  Is this available for all businesses?
                </AccordionTrigger>
                <AccordionContent className="text-slate-600 pb-4">
                  We are currently running a pilot specifically in Guwahati, targeting local businesses, hotels, agencies, and event companies.
                </AccordionContent>
              </AccordionItem>

              <AccordionItem value="item-3" className="bg-white border border-slate-200 rounded-lg px-4 data-[state=open]:shadow-sm">
                <AccordionTrigger className="text-left font-semibold hover:no-underline py-4">
                  Can GoPanda arrange multiple vehicles?
                </AccordionTrigger>
                <AccordionContent className="text-slate-600 pb-4">
                  Yes, we try to coordinate with multiple verified rental partners simultaneously to fulfill larger requirements based on availability.
                </AccordionContent>
              </AccordionItem>

              <AccordionItem value="item-4" className="bg-white border border-slate-200 rounded-lg px-4 data-[state=open]:shadow-sm">
                <AccordionTrigger className="text-left font-semibold hover:no-underline py-4">
                  Do you provide GST invoices?
                </AccordionTrigger>
                <AccordionContent className="text-slate-600 pb-4">
                  We are exploring business billing and GST support with early partners. Current availability of GST invoices depends on the specific rental partner fulfilling your request.
                </AccordionContent>
              </AccordionItem>

              <AccordionItem value="item-5" className="bg-white border border-slate-200 rounded-lg px-4 data-[state=open]:shadow-sm">
                <AccordionTrigger className="text-left font-semibold hover:no-underline py-4">
                  Can rental shops set their own rates?
                </AccordionTrigger>
                <AccordionContent className="text-slate-600 pb-4">
                  Yes. Rental partners stay completely in control of their pricing and availability. We do not force discounted rates.
                </AccordionContent>
              </AccordionItem>

              <AccordionItem value="item-6" className="bg-white border border-slate-200 rounded-lg px-4 data-[state=open]:shadow-sm">
                <AccordionTrigger className="text-left font-semibold hover:no-underline py-4">
                  Is there any commitment?
                </AccordionTrigger>
                <AccordionContent className="text-slate-600 pb-4">
                  No. Businesses can try the service with just one requirement. Rental shops can start by offering limited vehicles without blocking their inventory.
                </AccordionContent>
              </AccordionItem>
            </Accordion>
          </div>
        </section>

        {/* Final CTA */}
        <section className="py-24 bg-primary text-white text-center px-4">
          <div className="max-w-4xl mx-auto">
            <h2 className="font-display text-4xl font-bold tracking-tight mb-6">Need rental vehicles for your business?</h2>
            <p className="text-xl text-primary-foreground/90 max-w-2xl mx-auto mb-10">
              Send one requirement to GoPanda. We will coordinate with verified local rental partners.
            </p>
            <div className="flex flex-col sm:flex-row justify-center gap-4">
              <Button size="lg" onClick={scrollToPilot} className="h-14 px-8 rounded-full text-base font-semibold bg-white text-primary hover:bg-slate-100 hover:scale-105 transition-all w-full sm:w-auto shadow-xl">
                Join Business Pilot
              </Button>
              <Button size="lg" variant="outline" onClick={() => window.open(WHATSAPP_URL, "_blank")} className="h-14 px-8 rounded-full text-base font-semibold border-white/30 text-black hover:bg-white/10 w-full sm:w-auto">
                <MessageCircle className="mr-2 h-5 w-5 text-green-400" />
                WhatsApp Us
              </Button>
            </div>
          </div>
        </section>
      </div>
    </>
  );
}
