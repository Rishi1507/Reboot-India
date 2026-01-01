import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";

interface BookingModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  trekSlug: string;
  trekTitle: string;
  pricePerPerson: string;
}

export function BookingModal({
  open,
  onOpenChange,
  trekSlug,
  trekTitle,
  pricePerPerson,
}: BookingModalProps) {
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);

  const [formData, setFormData] = useState({
    userName: "",
    userEmail: "",
    userPhone: "",
    numberOfParticipants: "1",
  });

  const price = parseInt(pricePerPerson.replace(/[^\d]/g, ""));
  const totalPrice = price * parseInt(formData.numberOfParticipants);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const res = await fetch("http://localhost:5000/api/bookings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          trekSlug,
          trekTitle,
          userName: formData.userName,
          userEmail: formData.userEmail,
          userPhone: formData.userPhone,
          numberOfParticipants: Number(formData.numberOfParticipants),
          pricePerPerson: price,
          totalPrice,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data?.error || "Booking failed");
      }

      toast({
        title: "Booking Successful 🎉",
        description:
          "Your booking details have been submitted. Our team will contact you shortly.",
      });

      // Reset form & close modal
      setFormData({
        userName: "",
        userEmail: "",
        userPhone: "",
        numberOfParticipants: "1",
      });

      onOpenChange(false);
    } catch (error) {
      toast({
        title: "Booking Failed",
        description:
          "Unable to submit booking right now. Please try again later.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Book {trekTitle}</DialogTitle>
          <DialogDescription>
            Fill in your details to proceed with booking
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label>Full Name</Label>
            <Input
              value={formData.userName}
              onChange={(e) =>
                setFormData({ ...formData, userName: e.target.value })
              }
              required
            />
          </div>

          <div>
            <Label>Email Address</Label>
            <Input
              type="email"
              value={formData.userEmail}
              onChange={(e) =>
                setFormData({ ...formData, userEmail: e.target.value })
              }
              required
            />
          </div>

          <div>
            <Label>Phone Number</Label>
            <Input
              type="tel"
              value={formData.userPhone}
              onChange={(e) =>
                setFormData({ ...formData, userPhone: e.target.value })
              }
              required
              minLength={10}
            />
          </div>

          <div>
            <Label>Number of Participants</Label>
            <select
              className="w-full border rounded-lg px-3 py-2"
              value={formData.numberOfParticipants}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  numberOfParticipants: e.target.value,
                })
              }
            >
              {Array.from({ length: 20 }, (_, i) => i + 1).map((n) => (
                <option key={n} value={n}>
                  {n} {n === 1 ? "Person" : "People"}
                </option>
              ))}
            </select>
          </div>

          <div className="bg-gray-50 border rounded-lg p-4">
            <div className="flex justify-between">
              <span>Price per person</span>
              <span>₹{price}</span>
            </div>
            <div className="flex justify-between font-bold text-lg mt-2">
              <span>Total</span>
              <span className="text-maroon">₹{totalPrice}</span>
            </div>
          </div>

          <Button
            type="submit"
            className="w-full bg-maroon text-white py-3 font-bold"
            disabled={loading}
          >
            {loading ? "Submitting..." : "Confirm Booking"}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}
