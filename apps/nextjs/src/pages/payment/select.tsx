import React, { useState } from "react";
import { useRouter } from "next/router";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Separator } from "@/components/ui/separator";
import { ArrowLeft } from "lucide-react";

const BASE_PRICE = 17.95;
const PER_DAY_EXTRA_COST = 8;
const RAPID_CERT_COST = 25;

export default function PriceSelectionPage() {
  const router = useRouter();
  const [selectedDays, setSelectedDays] = useState<number>(1);
  // Explicitly handle boolean state for checkbox
  const [isRapid, setIsRapid] = useState<boolean>(false);

  const calculateTotal = () => {
    let total = BASE_PRICE;
    /* _ Calculate cost based on selected days. Base price covers the first day. _ */
    if (selectedDays > 1) {
      total += (selectedDays - 1) * PER_DAY_EXTRA_COST;
    }
    /* _ Add rapid cost if selected _ */
    if (isRapid) {
      total += RAPID_CERT_COST;
    }
    return total;
  };

  const totalAmount = calculateTotal();

  const handleProceedToPayment = async () => {
    /* _ Navigate to the payment route, passing the calculated amount and a description.
         Amount is converted to cents for payment processing. Using Math.round for safety. _ */
    await router.push({
      pathname: "/payment", // Assuming /payment handles the checkout session creation
      query: {
        amount: Math.round(totalAmount * 100), // Convert to cents
        description: `Medical Certificate (${selectedDays} Day${
          selectedDays > 1 ? "s" : ""
        })${isRapid ? " + Rapid" : ""}`,
        isRapid: isRapid.toString(), // Add explicit isRapid parameter
        days: selectedDays.toString(), // Add explicit days parameter
        redirectTo: "/dashboard", // Redirect on successful payment
        returnTo: "/payment/select", // Return here on cancellation
      },
    });
  };

  const handleBack = async () => {
    // Navigate to the cancel page instead of dashboard
    await router.push("/payment/cancel");
  };

  return (
    <div className="container mx-auto min-h-screen p-4 py-8">
      {/* Navigation and Title */}
      <div className="mb-8 flex items-center gap-4">
        <Button variant="outline" size="icon" onClick={handleBack}>
          <ArrowLeft className="h-4 w-4" />
          <span className="sr-only">Back</span>
        </Button>
        <h1 className="text-2xl font-bold">Select Your Certificate Options</h1>
      </div>

      <div className="mx-auto max-w-md space-y-6">
        {/* Main Options Card */}
        <Card>
          <CardHeader>
            <CardTitle>Standard Medical Certificate</CardTitle>
            <CardDescription>
              Starts at ${BASE_PRICE.toFixed(2)} for 1 day. Select duration and
              options below.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Duration Selection */}
            <div>
              <Label className="text-base font-medium">Duration</Label>
              <RadioGroup
                value={String(selectedDays)}
                onValueChange={(value) => setSelectedDays(Number(value))}
                className="mt-2 grid grid-cols-3 gap-4"
              >
                {[1, 2, 3].map((days) => (
                  <Label
                    key={days}
                    htmlFor={`days-${days}`}
                    className={`flex cursor-pointer flex-col items-center justify-between rounded-md border-2 ${selectedDays === days ? "border-primary" : "border-border"} bg-background p-4 transition-colors hover:bg-accent hover:text-accent-foreground`}
                  >
                    <RadioGroupItem
                      value={String(days)}
                      id={`days-${days}`}
                      className="sr-only"
                    />
                    <span className="text-sm font-medium">
                      {days} Day{days > 1 ? "s" : ""}
                    </span>
                    <span className="mt-1 text-xs text-muted-foreground">
                      $
                      {(BASE_PRICE + (days - 1) * PER_DAY_EXTRA_COST).toFixed(
                        2,
                      )}
                    </span>
                  </Label>
                ))}
              </RadioGroup>
            </div>

            <Separator />

            {/* Rapid Option */}
            <div className="flex items-center space-x-3">
              <Checkbox
                id="rapid-cert"
                checked={isRapid}
                // Ensure boolean value is passed
                onCheckedChange={(checked) => setIsRapid(Boolean(checked))}
              />
              <Label
                htmlFor="rapid-cert"
                className="flex flex-grow cursor-pointer items-center justify-between text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
              >
                <span>Rapid Certificate (15-60 minutes)</span>
                <span className="font-semibold text-foreground">
                  +${RAPID_CERT_COST.toFixed(2)}
                </span>
              </Label>
            </div>
          </CardContent>
        </Card>

        {/* Total and Payment Button */}
        <Card>
          <CardContent className="flex items-center justify-between p-6">
            <div className="text-lg font-semibold">Total</div>
            <div className="text-2xl font-bold">${totalAmount.toFixed(2)}</div>
          </CardContent>
        </Card>

        <Button
          className="w-full"
          size="lg"
          onClick={() => void handleProceedToPayment()}
        >
          Proceed to Payment
        </Button>
      </div>
    </div>
  );
}
