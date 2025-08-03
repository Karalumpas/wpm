'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Store, X } from 'lucide-react';

const shopSchema = z.object({
  name: z.string().min(1, 'Shop navn er påkrævet'),
  url: z.string().url('Indtast en gyldig URL'),
  apiKey: z.string().min(1, 'API nøgle er påkrævet'),
  apiSecret: z.string().min(1, 'API secret er påkrævet'),
});

type ShopFormData = z.infer<typeof shopSchema>;

interface Shop {
  id: string;
  name: string;
  url: string;
  apiKey: string;
  apiSecret: string;
  isConnected: boolean;
  lastSync?: string;
}

interface ShopFormProps {
  shop?: Shop;
  onSave: (data: Omit<Shop, 'id' | 'isConnected'>) => Promise<void>;
  onCancel: () => void;
}

export function ShopForm({ shop, onSave, onCancel }: ShopFormProps) {
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<ShopFormData>({
    resolver: zodResolver(shopSchema),
    defaultValues: {
      name: shop?.name || '',
      url: shop?.url || '',
      apiKey: shop?.apiKey || '',
      apiSecret: shop?.apiSecret || '',
    },
  });

  const onSubmit = async (data: ShopFormData) => {
    try {
      await onSave({
        ...data,
        lastSync: shop?.lastSync,
      });
    } catch (error) {
      console.error('Error saving shop:', error);
    }
  };

  return (
    <Card className="mb-6">
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Store className="w-5 h-5" />
            {shop ? 'Rediger Shop' : 'Ny Shop'}
          </div>
          <Button variant="ghost" size="sm" onClick={onCancel}>
            <X className="w-4 h-4" />
          </Button>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="name">Shop Navn</Label>
              <Input
                id="name"
                {...register('name')}
                placeholder="Min WooCommerce Shop"
                aria-invalid={errors.name ? 'true' : 'false'}
              />
              {errors.name && (
                <p className="text-sm text-red-600">{errors.name.message}</p>
              )}
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="url">Shop URL</Label>
              <Input
                id="url"
                type="url"
                {...register('url')}
                placeholder="https://minshop.dk"
                aria-invalid={errors.url ? 'true' : 'false'}
              />
              {errors.url && (
                <p className="text-sm text-red-600">{errors.url.message}</p>
              )}
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="apiKey">Kunde nøgle</Label>
              <Input
                id="apiKey"
                {...register('apiKey')}
                placeholder="ck_xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx"
                aria-invalid={errors.apiKey ? 'true' : 'false'}
              />
              {errors.apiKey && (
                <p className="text-sm text-red-600">{errors.apiKey.message}</p>
              )}
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="apiSecret">Kunde secret</Label>
              <Input
                id="apiSecret"
                type="password"
                {...register('apiSecret')}
                placeholder="cs_xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx"
                aria-invalid={errors.apiSecret ? 'true' : 'false'}
              />
              {errors.apiSecret && (
                <p className="text-sm text-red-600">{errors.apiSecret.message}</p>
              )}
            </div>
          </div>
          
          <div className="flex flex-col sm:flex-row gap-3 pt-4">
            <Button 
              type="submit" 
              disabled={isSubmitting}
              className="w-full sm:w-auto"
            >
              {isSubmitting ? 'Gemmer...' : shop ? 'Opdater Shop' : 'Opret Shop'}
            </Button>
            <Button 
              type="button" 
              variant="outline" 
              onClick={onCancel}
              className="w-full sm:w-auto"
            >
              Annuller
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}