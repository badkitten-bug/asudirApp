"use client"

import { useState, useEffect } from "react"
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  StatusBar as RNStatusBar,
  FlatList,
  Modal,
  ScrollView,
  Dimensions,
  ActivityIndicator,
} from "react-native"
import { StatusBar } from "expo-status-bar"
import { Ionicons } from "@expo/vector-icons"
import { useRouter } from "expo-router"
import Constants from "expo-constants"
import { useDispatch, useSelector } from "../../store"
import { loadTickets, selectAllTickets, type Ticket as TicketBase } from "../../store/ticketsSlice"
import { selectAllPozos } from "../../store/pozosSlice"
import { showSnackbar } from "../../store/snackbarSlice"

const STATUSBAR_HEIGHT = Constants.statusBarHeight || 0
const { width: SCREEN_WIDTH } = Dimensions.get("window")

// Opciones para los filtros
const MESES = [
  { label: "Enero", value: "01" },
  { label: "Febrero", value: "02" },
  { label: "Marzo", value: "03" },
  { label: "Abril", value: "04" },
  { label: "Mayo", value: "05" },
  { label: "Junio", value: "06" },
  { label: "Julio", value: "07" },
  { label: "Agosto", value: "08" },
  { label: "Septiembre", value: "09" },
  { label: "Octubre", value: "10" },
  { label: "Noviembre", value: "11" },
  { label: "Diciembre", value: "12" },
]

// Tipo para los datos de lectura en la UI
interface LecturaData {
  fecha: string;
  pozoNombre: string;
  pozoUbicacion: string;
  bateria: string;
  usuario: string;
  volumen: string | number;
  gasto: string | number;
  lecturaElectrica: string;
  observaciones: string;
  ticketNumero: string;
  ticketId: string | null;
  pozoId?: string; // ID del pozo para filtros
}

export default function RegistroLecturasScreen() {
  const router = useRouter()
  const dispatch = useDispatch()
  const pozos = useSelector(selectAllPozos)
  const user = useSelector((state: any) => state.auth.user)

  // Estado para lecturas reales del backend
  const [lecturas, setLecturas] = useState<LecturaData[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [showFilters, setShowFilters] = useState(false)
  const [searchQuery, setSearchQuery] = useState("")

  // Estados para los filtros
  const [filtroPozo, setFiltroPozo] = useState("")
  const [filtroBateria, setFiltroBateria] = useState("")
  const [filtroDia, setFiltroDia] = useState("")
  const [filtroMes, setFiltroMes] = useState("")
  const [filtroAno, setFiltroAno] = useState("")
  const [filtroFechaInicio, setFiltroFechaInicio] = useState("")
  const [filtroFechaFin, setFiltroFechaFin] = useState("")

  useEffect(() => {
    const fetchLecturas = async () => {
      if (!user || !user.token) return;
      setIsLoading(true)
      try {
        const res = await fetch(`${process.env.EXPO_PUBLIC_API_URL}/api/lectura-pozos?populate[ticket]=true&populate[pozo]=true&populate[usuario_pozo]=true&populate[ciclo]=true`, {
          headers: { 'Authorization': `Bearer ${user.token}` }
        })
        const data = await res.json()
        // Mapear cada lectura a un objeto para la UI
        const lecturasMapped = (data.data ?? []).map((l: any) => ({
          fecha: l.fecha ? l.fecha.split('T')[0] : 'No disponible',
          pozoNombre: l.pozo?.numeropozo ?? 'No disponible',
          pozoUbicacion: l.pozo?.predio ?? 'No disponible',
          bateria: l.pozo?.bateria?.nombrebateria ?? 'No disponible',
          usuario: l.usuario_pozo?.nombre ?? 'No disponible',
          volumen: l.volumen ?? 'No disponible',
          gasto: l.gasto ?? 'No disponible',
          lecturaElectrica: l.lectura_electrica ?? 'No disponible',
          observaciones: l.observaciones ?? 'Sin observaciones',
          ticketNumero: l.ticket?.numeroTicket ?? 'No disponible',
          ticketId: l.ticket?.documentId ?? null,
          pozoId: l.pozo?.id,
        }))
        setLecturas(lecturasMapped)
      } catch (e) {
        setLecturas([])
      } finally {
        setIsLoading(false)
      }
    }
    fetchLecturas()
  }, [user])

  // Obtener baterías únicas para el filtro
  const baterias = Array.from(new Set(pozos.map((pozo) => pozo.bateria)))

  // Obtener años únicos para el filtro
  const anos = Array.from(
    new Set(
      lecturas
        .map((lectura) => {
          const fecha = lectura.fecha.split("-")
          return fecha.length > 0 ? fecha[0] : ""
        })
        .filter(Boolean),
    ),
  ).sort((a, b) => b.localeCompare(a)) // Ordenar descendente

  // Aplicar filtros a las lecturas
  const filteredLecturas = lecturas.filter((lectura) => {
    // Filtro por búsqueda
    const matchesSearch =
      searchQuery === "" ||
      lectura.pozoNombre.toLowerCase().includes(searchQuery.toLowerCase()) ||
      lectura.pozoUbicacion.toLowerCase().includes(searchQuery.toLowerCase())

    // Filtro por pozo
    const matchesPozo = filtroPozo === "" || lectura.pozoNombre === filtroPozo

    // Filtro por batería
    const matchesBateria = filtroBateria === "" || (lectura.pozoId && pozos.find((p) => p.id === lectura.pozoId)?.bateria === filtroBateria)

    // Filtrar por fecha
    const fechaParts = lectura.fecha.split("-")
    const ano = fechaParts.length > 0 ? fechaParts[0] : ""
    const mes = fechaParts.length > 1 ? fechaParts[1] : ""
    const dia = fechaParts.length > 2 ? fechaParts[2] : ""

    const matchesDia = filtroDia === "" || dia === filtroDia
    const matchesMes = filtroMes === "" || mes === filtroMes
    const matchesAno = filtroAno === "" || ano === filtroAno

    // Filtro por rango de fechas
    let matchesRangoFechas = true
    if (filtroFechaInicio !== "" && filtroFechaFin !== "") {
      const fechaLectura = new Date(lectura.fecha)
      const fechaInicio = new Date(filtroFechaInicio)
      const fechaFin = new Date(filtroFechaFin)

      matchesRangoFechas = fechaLectura >= fechaInicio && fechaLectura <= fechaFin
    }

    return (
      matchesSearch && matchesPozo && matchesBateria && matchesDia && matchesMes && matchesAno && matchesRangoFechas
    )
  })

  // Función para limpiar todos los filtros
  const handleClearFilters = () => {
    setFiltroPozo("")
    setFiltroBateria("")
    setFiltroDia("")
    setFiltroMes("")
    setFiltroAno("")
    setFiltroFechaInicio("")
    setFiltroFechaFin("")
    setSearchQuery("")
  }

  // Renderizar cada item de la lista
  const renderLecturaItem = ({ item }: { item: any }) => (
    <TouchableOpacity
      style={styles.ticketItem}
      onPress={() => {
        if (item.ticketId) {
          router.push({ pathname: "/ticket", params: { ticketDocumentId: item.ticketId } });
        } else {
          dispatch(showSnackbar({ message: "Este registro no tiene ticket generado.", type: "warning", duration: 2000 }));
        }
      }}
    >
      <View style={styles.ticketHeader}>
        <View style={styles.ticketHeaderLeft}>
          <Text style={styles.ticketId}>Ticket: {item.ticketNumero}</Text>
          <Text style={styles.ticketFecha}>Fecha: {item.fecha}</Text>
        </View>
      </View>
      <View style={styles.ticketContent}>
        <View style={styles.ticketRow}>
          <Text style={styles.ticketLabel}>Pozo:</Text>
          <Text style={styles.ticketValue}>{item.pozoNombre || 'Sin dato'}</Text>
        </View>
        <View style={styles.ticketRow}>
          <Text style={styles.ticketLabel}>Predio:</Text>
          <Text style={styles.ticketValue}>{item.pozoUbicacion || 'Sin dato'}</Text>
        </View>
        <View style={styles.ticketRow}>
          <Text style={styles.ticketLabel}>Batería:</Text>
          <Text style={styles.ticketValue}>{item.bateria || 'Sin dato'}</Text>
        </View>
        <View style={styles.ticketRow}>
          <Text style={styles.ticketLabel}>Usuario:</Text>
          <Text style={styles.ticketValue}>{item.usuario || 'Sin dato'}</Text>
        </View>
        <View style={styles.ticketRow}>
          <Text style={styles.ticketLabel}>Lectura Volumen:</Text>
          <Text style={styles.ticketValue}>{item.volumen || 'Sin dato'}</Text>
        </View>
        <View style={styles.ticketRow}>
          <Text style={styles.ticketLabel}>Gasto:</Text>
          <Text style={styles.ticketValue}>{item.gasto || 'Sin dato'}</Text>
        </View>
        <View style={styles.ticketRow}>
          <Text style={styles.ticketLabel}>Lectura Eléctrica:</Text>
          <Text style={styles.ticketValue}>{item.lecturaElectrica || 'Sin dato'}</Text>
        </View>
        <View style={styles.ticketRow}>
          <Text style={styles.ticketLabel}>Observaciones:</Text>
          <Text style={styles.ticketValue}>{item.observaciones || 'Sin observaciones'}</Text>
        </View>
      </View>
    </TouchableOpacity>
  )

  // Renderizar mensaje cuando no hay resultados
  const renderEmptyList = () => (
    <View style={styles.emptyContainer}>
      <Ionicons name="document-text-outline" size={64} color="#ccc" />
      <Text style={styles.emptyText}>No hay lecturas registradas</Text>
    </View>
  )

  return (
    <View style={styles.container}>
      {/* Configuración del StatusBar */}
      <RNStatusBar backgroundColor="#fff" barStyle="dark-content" translucent={true} />
      <StatusBar style="dark" />

      {/* Espacio para el StatusBar */}
      <View style={{ height: STATUSBAR_HEIGHT, backgroundColor: "#fff" }} />

      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Registro de Lecturas</Text>
        <TouchableOpacity style={styles.filterButton} onPress={() => setShowFilters(true)}>
          <Ionicons name="options-outline" size={24} color="#00A86B" />
        </TouchableOpacity>
      </View>

      {/* Barra de búsqueda */}
      <View style={styles.searchContainer}>
        <Ionicons name="search" size={20} color="#999" style={styles.searchIcon} />
        <TextInput
          style={styles.searchInput}
          placeholder="Buscar..."
          value={searchQuery}
          onChangeText={setSearchQuery}
        />
        {searchQuery.length > 0 && (
          <TouchableOpacity onPress={() => setSearchQuery("")} style={styles.clearButton}>
            <Ionicons name="close-circle" size={20} color="#999" />
          </TouchableOpacity>
        )}
      </View>

      {/* Indicadores de filtros activos */}
      {(filtroPozo || filtroBateria || filtroDia || filtroMes || filtroAno || filtroFechaInicio) && (
        <View style={styles.activeFiltersContainer}>
          <Text style={styles.activeFiltersText}>Filtros activos: {filteredLecturas.length} resultados</Text>
          <TouchableOpacity onPress={handleClearFilters}>
            <Text style={styles.clearFiltersLink}>Limpiar</Text>
          </TouchableOpacity>
        </View>
      )}

      {/* Lista de lecturas */}
      {isLoading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#00A86B" />
          <Text style={styles.loadingText}>Cargando lecturas...</Text>
        </View>
      ) : (
        <FlatList
          data={filteredLecturas}
          renderItem={renderLecturaItem}
          keyExtractor={(item) => item.ticketId ?? Math.random().toString()}
          ListEmptyComponent={renderEmptyList}
          contentContainerStyle={styles.listContent}
        />
      )}

      {/* Modal de filtros */}
      <Modal visible={showFilters} animationType="slide" transparent onRequestClose={() => setShowFilters(false)}>
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Filtros</Text>
              <TouchableOpacity onPress={() => setShowFilters(false)}>
                <Ionicons name="close" size={24} color="#333" />
              </TouchableOpacity>
            </View>

            <ScrollView style={styles.filtersScrollView}>
              {/* Filtro por pozo */}
              <View style={styles.filterSection}>
                <Text style={styles.filterTitle}>Pozo</Text>
                <View style={styles.filterOptions}>
                  <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                    <TouchableOpacity
                      style={[styles.filterChip, filtroPozo === "" && styles.filterChipSelected]}
                      onPress={() => setFiltroPozo("")}
                    >
                      <Text style={[styles.filterChipText, filtroPozo === "" && styles.filterChipTextSelected]}>
                        Todos
                      </Text>
                    </TouchableOpacity>

                    {pozos.map((pozo) => (
                      <TouchableOpacity
                        key={pozo.id}
                        style={[styles.filterChip, filtroPozo === pozo.id && styles.filterChipSelected]}
                        onPress={() => setFiltroPozo(pozo.id)}
                      >
                        <Text style={[styles.filterChipText, filtroPozo === pozo.id && styles.filterChipTextSelected]}>
                          {pozo.nombre ? String(pozo.nombre) : 'Sin dato'}
                        </Text>
                      </TouchableOpacity>
                    ))}
                  </ScrollView>
                </View>
              </View>

              {/* Filtro por batería */}
              <View style={styles.filterSection}>
                <Text style={styles.filterTitle}>Batería</Text>
                <View style={styles.filterOptions}>
                  <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                    <TouchableOpacity
                      style={[styles.filterChip, filtroBateria === "" && styles.filterChipSelected]}
                      onPress={() => setFiltroBateria("")}
                    >
                      <Text style={[styles.filterChipText, filtroBateria === "" && styles.filterChipTextSelected]}>
                        Todas
                      </Text>
                    </TouchableOpacity>

                    {baterias.map((bateria) => (
                      <TouchableOpacity
                        key={bateria || 'sin-bateria'}
                        style={[styles.filterChip, filtroBateria === bateria && styles.filterChipSelected]}
                        onPress={() => setFiltroBateria(bateria)}
                      >
                        <Text style={[styles.filterChipText, filtroBateria === bateria && styles.filterChipTextSelected]}>
                          {bateria ? String(bateria) : 'Sin dato'}
                        </Text>
                      </TouchableOpacity>
                    ))}
                  </ScrollView>
                </View>
              </View>

              {/* Filtro por año */}
              <View style={styles.filterSection}>
                <Text style={styles.filterTitle}>Año</Text>
                <View style={styles.filterOptions}>
                  <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                    <TouchableOpacity
                      style={[styles.filterChip, filtroAno === "" && styles.filterChipSelected]}
                      onPress={() => setFiltroAno("")}
                    >
                      <Text style={[styles.filterChipText, filtroAno === "" && styles.filterChipTextSelected]}>
                        Todos
                      </Text>
                    </TouchableOpacity>

                    {anos.map((ano) => (
                      <TouchableOpacity
                        key={ano || 'sin-ano'}
                        style={[styles.filterChip, filtroAno === ano && styles.filterChipSelected]}
                        onPress={() => setFiltroAno(ano)}
                      >
                        <Text style={[styles.filterChipText, filtroAno === ano && styles.filterChipTextSelected]}>
                          {ano ? String(ano) : 'Sin dato'}
                        </Text>
                      </TouchableOpacity>
                    ))}
                  </ScrollView>
                </View>
              </View>

              {/* Filtro por mes */}
              <View style={styles.filterSection}>
                <Text style={styles.filterTitle}>Mes</Text>
                <View style={styles.filterOptions}>
                  <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                    <TouchableOpacity
                      style={[styles.filterChip, filtroMes === "" && styles.filterChipSelected]}
                      onPress={() => setFiltroMes("")}
                    >
                      <Text style={[styles.filterChipText, filtroMes === "" && styles.filterChipTextSelected]}>
                        Todos
                      </Text>
                    </TouchableOpacity>

                    {MESES.map((mes) => (
                      <TouchableOpacity
                        key={mes.value}
                        style={[styles.filterChip, filtroMes === mes.value && styles.filterChipSelected]}
                        onPress={() => setFiltroMes(mes.value)}
                      >
                        <Text style={[styles.filterChipText, filtroMes === mes.value && styles.filterChipTextSelected]}>
                          {mes.label ? String(mes.label) : 'Sin dato'}
                        </Text>
                      </TouchableOpacity>
                    ))}
                  </ScrollView>
                </View>
              </View>

              {/* Filtro por día */}
              <View style={styles.filterSection}>
                <Text style={styles.filterTitle}>Día</Text>
                <View style={styles.filterInputRow}>
                  <TextInput
                    style={styles.filterInput}
                    placeholder="Día (01-31)"
                    value={filtroDia}
                    onChangeText={setFiltroDia}
                    keyboardType="number-pad"
                    maxLength={2}
                  />
                  <TouchableOpacity style={styles.filterInputClear} onPress={() => setFiltroDia("")}>
                    <Ionicons name="close-circle" size={20} color="#999" />
                  </TouchableOpacity>
                </View>
              </View>

              {/* Filtro por rango de fechas */}
              <View style={styles.filterSection}>
                <Text style={styles.filterTitle}>Rango de fechas</Text>
                <View style={styles.dateRangeContainer}>
                  <View style={styles.dateInputContainer}>
                    <Text style={styles.dateInputLabel}>Desde:</Text>
                    <TextInput
                      style={styles.dateInput}
                      placeholder="AAAA-MM-DD"
                      value={filtroFechaInicio}
                      onChangeText={setFiltroFechaInicio}
                    />
                  </View>

                  <View style={styles.dateInputContainer}>
                    <Text style={styles.dateInputLabel}>Hasta:</Text>
                    <TextInput
                      style={styles.dateInput}
                      placeholder="AAAA-MM-DD"
                      value={filtroFechaFin}
                      onChangeText={setFiltroFechaFin}
                    />
                  </View>
                </View>
              </View>
            </ScrollView>

            <View style={styles.modalFooter}>
              <TouchableOpacity style={styles.clearFiltersButton} onPress={handleClearFilters}>
                <Text style={styles.clearFiltersText}>Limpiar filtros</Text>
              </TouchableOpacity>

              <TouchableOpacity style={styles.applyFiltersButton} onPress={() => setShowFilters(false)}>
                <Text style={styles.applyFiltersText}>Aplicar</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f5f5f5",
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: "#fff",
    borderBottomWidth: 1,
    borderBottomColor: "#eee",
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#333",
  },
  filterButton: {
    padding: 4,
  },
  searchContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "white",
    marginHorizontal: 16,
    marginVertical: 12,
    paddingHorizontal: 12,
    borderRadius: 8,
    height: 40,
    boxShadow: "0px 1px 2px rgba(0, 0, 0, 0.1)",
    elevation: 2,
  },
  searchIcon: {
    marginRight: 8,
  },
  searchInput: {
    flex: 1,
    height: 40,
    fontSize: 14,
  },
  clearButton: {
    padding: 4,
  },
  activeFiltersContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 8,
    backgroundColor: "#e6f7f0",
  },
  activeFiltersText: {
    fontSize: 12,
    color: "#00A86B",
  },
  clearFiltersLink: {
    fontSize: 12,
    color: "#00A86B",
    fontWeight: "bold",
  },
  listContent: {
    paddingHorizontal: 16,
    paddingTop: 8,
    paddingBottom: 20,
  },
  ticketItem: {
    backgroundColor: "white",
    borderRadius: 8,
    padding: 12,
    marginBottom: 8,
    boxShadow: "0px 1px 2px rgba(0, 0, 0, 0.1)",
    elevation: 1,
  },
  ticketHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 8,
    paddingBottom: 8,
    borderBottomWidth: 1,
    borderBottomColor: "#f0f0f0",
  },
  ticketHeaderLeft: {
    flexDirection: "column",
  },
  ticketId: {
    fontSize: 12,
    fontWeight: "bold",
    color: "#333",
  },
  ticketFecha: {
    fontSize: 12,
    color: "#666",
    marginTop: 2,
  },
  moreButton: {
    padding: 4,
  },
  ticketContent: {
    flexDirection: "column",
  },
  ticketRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 4,
  },
  ticketLabel: {
    width: 120,
    fontSize: 12,
    fontWeight: "500",
    color: "#666",
  },
  ticketValue: {
    flex: 1,
    fontSize: 12,
    color: "#333",
  },
  iconButton: {
    padding: 4,
  },
  separator: {
    height: 8,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: "#666",
  },
  emptyContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 24,
    marginTop: 40,
  },
  emptyText: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#666",
    marginTop: 16,
  },
  emptySubtext: {
    fontSize: 14,
    color: "#999",
    marginTop: 8,
    textAlign: "center",
    marginBottom: 16,
  },
  clearFiltersButton: {
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderWidth: 1,
    borderColor: "#00A86B",
    borderRadius: 4,
  },
  clearFiltersText: {
    color: "#00A86B",
    fontSize: 14,
  },
  modalContainer: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.5)",
    justifyContent: "flex-end",
  },
  modalContent: {
    backgroundColor: "white",
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 24,
    maxHeight: "80%",
  },
  modalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 16,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: "bold",
  },
  filtersScrollView: {
    maxHeight: "70%",
  },
  filterSection: {
    marginBottom: 16,
  },
  filterTitle: {
    fontSize: 16,
    fontWeight: "500",
    marginBottom: 8,
  },
  filterOptions: {
    flexDirection: "row",
  },
  filterChip: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    backgroundColor: "#f0f0f0",
    marginRight: 8,
    marginBottom: 8,
  },
  filterChipSelected: {
    backgroundColor: "#00A86B",
  },
  filterChipText: {
    fontSize: 14,
    color: "#666",
  },
  filterChipTextSelected: {
    color: "white",
  },
  filterInputRow: {
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 8,
    paddingHorizontal: 12,
    height: 40,
  },
  filterInput: {
    flex: 1,
    height: 40,
    fontSize: 14,
  },
  filterInputClear: {
    padding: 4,
  },
  dateRangeContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  dateInputContainer: {
    width: "48%",
  },
  dateInputLabel: {
    fontSize: 12,
    color: "#666",
    marginBottom: 4,
  },
  dateInput: {
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 8,
    paddingHorizontal: 12,
    height: 40,
    fontSize: 14,
  },
  modalFooter: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 16,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: "#f0f0f0",
  },
  applyFiltersButton: {
    backgroundColor: "#00A86B",
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 4,
  },
  applyFiltersText: {
    color: "white",
    fontWeight: "bold",
    fontSize: 14,
  },
})

