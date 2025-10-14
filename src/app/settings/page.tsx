'use client';

import { useUser } from '@/firebase';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { updateProfile } from 'firebase/auth';
import { getStorage, ref as storageRef, uploadBytes, getDownloadURL } from 'firebase/storage';
import React, { useState, useEffect, useRef } from 'react';
import { Skeleton } from '@/components/ui/skeleton';

export default function SettingsPage() {
  const { user, isUserLoading } = useUser();
  const [displayName, setDisplayName] = useState('');
  const [isUploading, setIsUploading] = useState(false);
  const { toast } = useToast();
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (user) {
      setDisplayName(user.displayName || '');
    }
  }, [user]);

  const getInitials = (email?: string | null) => {
    if (!email) return "U";
    const nameParts = (displayName || '').split(' ');
    if (nameParts.length > 1 && nameParts[0] && nameParts[1]) {
        return nameParts[0].charAt(0) + nameParts[1].charAt(0);
    }
    return email.substring(0, 2).toUpperCase();
  };

  const handleProfileUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    try {
      await updateProfile(user, {
        displayName: displayName,
      });
      toast({
        title: 'Perfil Actualizado',
        description: 'Tu nombre de usuario ha sido actualizado correctamente.',
      });
    } catch (error) {
      console.error(error);
      toast({
        variant: 'destructive',
        title: 'Actualización Fallida',
        description: 'No se pudo actualizar tu perfil. Por favor, inténtalo de nuevo.',
      });
    }
  };
  
  const handlePictureChangeClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file || !user) return;

    setIsUploading(true);

    try {
        const storage = getStorage();
        const fileRef = storageRef(storage, `profile-pictures/${user.uid}`);
        
        await uploadBytes(fileRef, file);
        const photoURL = await getDownloadURL(fileRef);

        await updateProfile(user, { photoURL });

        toast({
            title: "Foto de perfil actualizada",
            description: "Tu nueva foto de perfil se ha guardado.",
        });

    } catch (error) {
        console.error("Error al subir la imagen:", error);
        toast({
            variant: "destructive",
            title: "Error al subir",
            description: "No se pudo subir tu foto de perfil. Por favor, inténtalo de nuevo."
        });
    } finally {
        setIsUploading(false);
    }
  }


  if (isUserLoading) {
    return (
      <div className="flex flex-col gap-8">
        <div>
            <Skeleton className="h-9 w-32" />
            <Skeleton className="h-5 w-80 mt-2" />
        </div>
        <Skeleton className="h-96 w-full" />
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Ajustes</h1>
        <p className="text-muted-foreground">Gestiona la configuración de tu cuenta y perfil.</p>
      </div>

      <Card>
        <form onSubmit={handleProfileUpdate}>
          <CardHeader>
            <CardTitle>Perfil</CardTitle>
            <CardDescription>Actualiza tu información personal.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="flex items-center gap-6">
              <Avatar className="h-20 w-20">
                <AvatarImage src={user?.photoURL || ''} alt={user?.displayName || 'Usuario'} />
                <AvatarFallback>{getInitials(user?.email)}</AvatarFallback>
              </Avatar>
              <div className='flex flex-col gap-2'>
                <Button type="button" onClick={handlePictureChangeClick} disabled={isUploading}>
                  {isUploading ? "Subiendo..." : "Cambiar Foto"}
                </Button>
                <input type="file" ref={fileInputRef} onChange={handleFileChange} accept="image/png, image/jpeg, image/gif" className="hidden" />
                <p className='text-sm text-muted-foreground'>JPG, GIF o PNG. 1MB máximo.</p>
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="displayName">Nombre de Usuario</Label>
              <Input
                id="displayName"
                value={displayName}
                onChange={(e) => setDisplayName(e.target.value)}
                placeholder="Introduce tu nombre de usuario"
                className="max-w-sm"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="email">Correo Electrónico</Label>
              <Input id="email" value={user?.email || ''} disabled className="max-w-sm" />
            </div>
          </CardContent>
          <CardFooter className="border-t px-6 py-4">
            <Button type="submit">Guardar Cambios</Button>
          </CardFooter>
        </form>
      </Card>
    </div>
  );
}
