
"use client";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
  DialogClose,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";
import type { Customer, SalesFunnelStage } from "@/lib/types";
import { zodResolver } from "@hookform/resolvers/zod";
import { PlusCircle } from "lucide-react";
import React from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { ActivityLog } from "./activity-log";
import {
  addDocumentNonBlocking,
  setDocumentNonBlocking,
  updateDocumentNonBlocking,
  useUser,
} from "@/firebase";
import { collection, doc, getFirestore } from "firebase/firestore";

const formSchema = z.object({
  firstName: z.string().min(2, { message: "El nombre debe tener al menos 2 caracteres." }),
  lastName: z.string().min(2, { message: "El apellido debe tener al menos 2 caracteres." }),
  email: z.string().email({ message: "Por favor, introduce un correo electrónico válido." }),
  phone: z.string().min(9, { message: "El número de teléfono es demasiado corto." }),
  address: z.string().optional(),
  stage: z.enum(["Lead", "Contactado", "Cita", "Calificado", "Cerrado"]),
});

type CustomerDialogProps = {
  customer?: Customer;
  children?: React.ReactNode;
};

export function CustomerDialog({ customer, children }: CustomerDialogProps) {
  const [open, setOpen] = React.useState(false);
  const { toast } = useToast();
  const { user } = useUser();
  const firestore = getFirestore();
  const isEditMode = !!customer;

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      firstName: customer?.firstName || "",
      lastName: customer?.lastName || "",
      email: customer?.email || "",
      phone: customer?.phone || "",
      address: customer?.address || "",
      stage: customer?.salesFunnelStatus?.status || "Lead",
    },
  });

  React.useEffect(() => {
    if (open) {
      form.reset({
        firstName: customer?.firstName || "",
        lastName: customer?.lastName || "",
        email: customer?.email || "",
        phone: customer?.phone || "",
        address: customer?.address || "",
        stage: customer?.salesFunnelStatus?.status || "Lead",
      });
    }
  }, [open, customer, form]);

  function onSubmit(values: z.infer<typeof formSchema>) {
    if (!user) {
      toast({
        variant: "destructive",
        title: "Error de autenticación",
        description: "Debes iniciar sesión para guardar un cliente.",
      });
      return;
    }

    const customerData: Omit<Customer, "id"> = {
      firstName: values.firstName,
      lastName: values.lastName,
      email: values.email,
      phone: values.phone,
      address: values.address,
      avatarUrl: customer?.avatarUrl || `https://picsum.photos/seed/${Math.random()}/40/40`,
      salesFunnelStatus: {
        status: values.stage,
        lastUpdated: new Date().toISOString(),
      },
    };

    if (isEditMode && customer?.id) {
      const customerRef = doc(
        firestore,
        `users/${user.uid}/customerProfiles/${customer.id}`
      );
      updateDocumentNonBlocking(customerRef, customerData);

    } else {
      const customersCol = collection(
        firestore,
        `users/${user.uid}/customerProfiles`
      );
      addDocumentNonBlocking(customersCol, customerData);
    }

    toast({
      title: `Cliente ${isEditMode ? "actualizado" : "creado"}`,
      description: `${values.firstName} ${values.lastName} ha sido guardado correctamente.`,
    });
    setOpen(false);
  }

  const trigger = children ? (
    <DialogTrigger asChild>{children}</DialogTrigger>
  ) : (
    <DialogTrigger asChild>
      <Button>
        <PlusCircle className="mr-2 h-4 w-4" />
        Nuevo Cliente
      </Button>
    </DialogTrigger>
  );

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      {trigger}
      <DialogContent className="sm:max-w-[625px]">
        <DialogHeader>
          <DialogTitle>
            {isEditMode ? "Editar Cliente" : "Añadir Nuevo Cliente"}
          </DialogTitle>
          <DialogDescription>
            {isEditMode
              ? "Actualiza el perfil del cliente y mira su actividad."
              : "Rellena los datos del nuevo cliente."}
          </DialogDescription>
        </DialogHeader>
        <Tabs defaultValue="profile">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="profile">Perfil</TabsTrigger>
            <TabsTrigger value="activity" disabled={!isEditMode}>
              Actividad
            </TabsTrigger>
          </TabsList>
          <TabsContent value="profile">
            <Form {...form}>
              <form
                onSubmit={form.handleSubmit(onSubmit)}
                className="space-y-4 py-4"
              >
                <div className="grid grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="firstName"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Nombre</FormLabel>
                        <FormControl>
                          <Input placeholder="John" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="lastName"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Apellido</FormLabel>
                        <FormControl>
                          <Input placeholder="Doe" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="email"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Correo Electrónico</FormLabel>
                        <FormControl>
                          <Input placeholder="john@example.com" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="phone"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Teléfono</FormLabel>
                        <FormControl>
                          <Input placeholder="123-456-7890" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
                 <FormField
                    control={form.control}
                    name="address"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Dirección</FormLabel>
                        <FormControl>
                          <Input placeholder="123 Main St, Anytown" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                <FormField
                  control={form.control}
                  name="stage"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Fase del Embudo de Ventas</FormLabel>
                      <Select
                        onValueChange={field.onChange}
                        defaultValue={field.value}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Selecciona una fase" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {(
                            [
                              "Lead",
                              "Contactado",
                              "Cita",
                              "Calificado",
                              "Cerrado",
                            ] as SalesFunnelStage[]
                          ).map((stage) => (
                            <SelectItem key={stage} value={stage}>
                              {stage}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <DialogFooter>
                  <DialogClose asChild>
                    <Button type="button" variant="secondary">
                      Cancelar
                    </Button>
                  </DialogClose>
                  <Button type="submit">Guardar cambios</Button>
                </DialogFooter>
              </form>
            </Form>
          </TabsContent>
          <TabsContent value="activity">
            <ActivityLog customerId={customer?.id} />
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
}
