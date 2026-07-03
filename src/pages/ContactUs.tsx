import React, { useState } from 'react';
import { Mail, Phone, MapPin, Send } from 'lucide-react';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Textarea } from '../components/ui/textarea';
import { Card, CardContent } from '../components/ui/card';
import { Label } from '../components/ui/label';
import { SEO } from '../components/common/SEO';

export default function ContactUs() {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    // Simulate API call
    setTimeout(() => {
      setIsSubmitting(false);
      setIsSubmitted(true);
    }, 1500);
  };

  return (
    <div className="min-h-screen bg-background py-24 px-4 sm:px-6 lg:px-8">
      <SEO 
        title="Contact Us - GoPanda" 
        description="Have questions about renting a vehicle, listing your fleet, or partnering with us? Our team is here to help."
      />
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-16">
          <h1 className="text-4xl md:text-5xl font-display font-bold tracking-tight mb-4">
            Get in <span className="text-gradient">Touch</span>
          </h1>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Have questions about renting a vehicle, listing your fleet, or partnering with us?
            Our team is here to help.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
          {/* Contact Information */}
          <div className="lg:col-span-1 space-y-8">
            <div>
              <h2 className="text-2xl font-semibold mb-6">Contact Information</h2>
              <p className="text-muted-foreground mb-8">
                Reach out to us directly or fill out the form, and we'll get back to you as soon as possible.
              </p>
            </div>

            <Card className="border-none shadow-elevated bg-card">
              <CardContent className="p-6 space-y-6">
                <div className="flex items-start space-x-4">
                  <div className="bg-primary/10 p-3 rounded-full">
                    <Mail className="h-6 w-6 text-primary" />
                  </div>
                  <div>
                    <h3 className="font-medium text-foreground">Email</h3>
                    <a href="mailto:hello@gopanda.in" className="text-primary font-medium hover:underline mt-2 inline-block">
                      hello@gopanda.in
                    </a>
                  </div>
                </div>

                <div className="flex items-start space-x-4">
                  <div className="bg-primary/10 p-3 rounded-full">
                    <Phone className="h-6 w-6 text-primary" />
                  </div>
                  <div>
                    <h3 className="font-medium text-foreground">Phone / WhatsApp</h3>
                    <p className="text-sm text-muted-foreground mt-1">Mon-Fri from 8am to 5pm.</p>
                    <a 
                      href="https://wa.me/918638578854?text=Hi%20GoPanda,%20I%20need%20help%20with%20a%20vehicle%20rental%20booking." 
                      target="_blank" 
                      rel="noopener noreferrer" 
                      className="text-primary font-medium hover:underline mt-2 inline-block"
                    >
                      +91 8638578854
                    </a>
                  </div>
                </div>

                <div className="flex items-start space-x-4">
                  <div className="bg-primary/10 p-3 rounded-full">
                    <MapPin className="h-6 w-6 text-primary" />
                  </div>
                  <div>
                    <h3 className="font-medium text-foreground">Office</h3>
                    <p className="text-sm text-muted-foreground mt-1">Come say hello at our office HQ.</p>
                    <p className="text-primary font-medium mt-2">
                      Zoo Road<br />
                      Guwahati, Assam 781024
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Contact Form */}
          <div className="lg:col-span-2">
            <Card className="border-none shadow-elevated bg-card">
              <CardContent className="p-8">
                {isSubmitted ? (
                  <div className="h-full flex flex-col items-center justify-center text-center py-16 space-y-4">
                    <div className="h-16 w-16 bg-primary/20 text-primary rounded-full flex items-center justify-center mb-4">
                      <Send className="h-8 w-8" />
                    </div>
                    <h3 className="text-2xl font-bold">Message Sent!</h3>
                    <p className="text-muted-foreground max-w-md">
                      Thank you for reaching out. We've received your message and will get back to you shortly.
                    </p>
                    <Button
                      variant="outline"
                      className="mt-6"
                      onClick={() => setIsSubmitted(false)}
                    >
                      Send another message
                    </Button>
                  </div>
                ) : (
                  <form onSubmit={handleSubmit} className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="space-y-2">
                        <Label htmlFor="firstName">First Name</Label>
                        <Input id="firstName" placeholder="John" required />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="lastName">Last Name</Label>
                        <Input id="lastName" placeholder="Doe" required />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="email">Email</Label>
                      <Input id="email" type="email" placeholder="john@example.com" required />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="subject">Subject</Label>
                      <Input id="subject" placeholder="How can we help you?" required />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="message">Message</Label>
                      <Textarea
                        id="message"
                        placeholder="Please provide details about your inquiry..."
                        rows={6}
                        required
                        className="resize-none"
                      />
                    </div>

                    <Button type="submit" className="w-full" disabled={isSubmitting}>
                      {isSubmitting ? (
                        <div className="flex items-center space-x-2">
                          <div className="h-4 w-4 rounded-full border-2 border-current border-t-transparent animate-spin" />
                          <span>Sending...</span>
                        </div>
                      ) : (
                        <div className="flex items-center justify-center space-x-2">
                          <Send className="h-4 w-4" />
                          <span>Send Message</span>
                        </div>
                      )}
                    </Button>
                  </form>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
