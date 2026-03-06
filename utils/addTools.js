export function registerRealtimeTools(client, context = {}) {
  const { ws } = context;

  client.addTool(
    {
      name: "book_appointment",
      description: "Books a medical appointment for the user.",
      parameters: {
        type: "object",
        properties: {
          patient_name: {
            type: "string",
            description: "Name of the patient booking the appointment"
          },
          doctor_name: {
            type: "string",
            description: "Name of the doctor for the appointment",
            nullable: true
          },
          department: {
            type: "string",
            description:
              "Department or specialty for the appointment (e.g., Cardiology, Dermatology)"
          },
          date: {
            type: "string",
            description: "Date of the appointment"
          },
          time: {
            type: "string",
            description: "Time of the appointment"
          }
        },

        required: ["patient_name", "doctor_name", "department", "date", "time"]
      }
    },

    async ({ patient_name, doctor_name, department, date, time }) => {
      
      console.log("🧰 Tool call detected → book_appointment");
      console.log("📅 Booking appointment:", {
        patient_name,
        doctor_name,
        department,
        date,
        time
      });

      const webhookUrl =
        "https://bha1725.app.n8n.cloud/webhook/soket-trigger";

      try {
        const response = await fetch(webhookUrl, {
          method: "POST",
          headers: {
            "Content-Type": "application/json"
          },
          body: JSON.stringify({
            intent: "book_appointment",
            patient_name,
            doctor_name,
            department,
            date,
            time
          })
        });

        const result = await response.text();
        console.log("📨 n8n Webhook Triggered:", result); 
      } catch (err) {
        console.error("❌ Error triggering n8n webhook:", err);
      }

      const confirmation = `✅ Appointment booked for ${patient_name} with Dr. ${doctor_name} in ${department} on ${date} at ${time}.`;

      return { 
        
        message: confirmation,
        patient_name,
        doctor_name,
        department,
        date,
        time
      };
    }
  );
}
