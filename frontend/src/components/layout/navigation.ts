import {
  BarChart3,
  BookOpen,
  Building2,
  ClipboardList,
  Map,
  Users,
  UserCog,
} from "lucide-react";

export interface NavigationItem {
  label: string;
  path: string;
  icon: React.ComponentType<{ size?: number; strokeWidth?: number }>;
  allowedRoles?: string[];
}

export interface NavigationGroup {
  label?: string;
  items: NavigationItem[];
}

export const navigationGroups: NavigationGroup[] = [
  {
    items: [
      {
        label: "Dashboard",
        path: "/dashboard",
        icon: BarChart3,
      },
    ],
  },

  {
    label: "Gestão",
    items: [
      {
        label: "Territórios",
        path: "/territorios",
        icon: Map,
      },
      {
        label: "Publicações",
        path: "/publicacoes",
        icon: BookOpen,
      },
      {
        label: "Pedidos",
        path: "/pedidos",
        icon: ClipboardList,
      },
    ],
  },

  {
    label: "Pessoas",
    items: [
      {
        label: "Publicadores",
        path: "/publicadores",
        icon: Users,
      },
      {
        label: "Usuários",
        path: "/admin/usuarios-congregacao",
        icon: UserCog,
        allowedRoles: [
          "ROLE_ADMIN_GERAL",
          "ROLE_SUPERINTENDENTE_SERVICO",
          "ROLE_ANCIAO",
        ],
      },
    ],
  },

  {
    label: "Administração",
    items: [
      {
        label: "Congregações",
        path: "/admin/congregacoes",
        icon: Building2,
        allowedRoles: ["ROLE_ADMIN_GERAL"],
      },
    ],
  },
];
