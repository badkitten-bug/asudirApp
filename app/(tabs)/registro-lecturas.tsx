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
import { loadTickets, selectAllTickets, type Ticket } from "../../store/ticketsSlice"
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

export default function RegistroLecturasScreen() {
  const router = useRouter()
  const dispatch = useDispatch()

  // Obtener datos de Redux
  const tickets = useSelector(selectAllTickets)
  const pozos = useSelector(selectAllPozos)

  // Estados para búsqueda y filtros
  const [searchQuery, setSearchQuery] = useState("")
  const [isLoading, setIsLoading] = useState(true)
  const [showFilters, setShowFilters] = useState(false)

  // Estados para los filtros
  const [filtroPozo, setFiltroPozo] = useState("")
  const [filtroBateria, setFiltroBateria] = useState("")
  const [filtroDia, setFiltroDia] = useState("")
  const [filtroMes, setFiltroMes] = useState("")
  const [filtroAno, setFiltroAno] = useState("")
  const [filtroFechaInicio, setFiltroFechaInicio] = useState("")
  const [filtroFechaFin, setFiltroFechaFin] = useState("")

  // Cargar tickets al montar el componente
  useEffect(() => {
    const fetchData = async () => {
      try {
        await dispatch(loadTickets()).unwrap()
      } catch (error) {
        console.error("Error al cargar tickets:", error)
        dispatch(
          showSnackbar({
            message: "Error al cargar las lecturas",
            type: "error",
            duration: 3000,
          }),
        )
      } finally {
        setIsLoading(false)
      }
    }

    fetchData()
  }, [dispatch])

  // Obtener baterías únicas para el filtro
  const baterias = Array.from(new Set(pozos.map((pozo) => pozo.bateria)))

  // Obtener años únicos para el filtro
  const anos = Array.from(
    new Set(
      tickets
        .map((ticket) => {
          const fecha = ticket.fecha.split("-")
          return fecha.length > 0 ? fecha[0] : ""
        })
        .filter(Boolean),
    ),
  ).sort((a, b) => b.localeCompare(a)) // Ordenar descendente

  // Aplicar filtros a los tickets
  const filteredTickets = tickets.filter((ticket) => {
    // Filtro por búsqueda
    const matchesSearch =
      searchQuery === "" ||
      ticket.pozoId.toLowerCase().includes(searchQuery.toLowerCase()) ||
      ticket.pozoNombre.toLowerCase().includes(searchQuery.toLowerCase()) ||
      ticket.pozoUbicacion.toLowerCase().includes(searchQuery.toLowerCase())

    // Filtro por pozo
    const matchesPozo = filtroPozo === "" || ticket.pozoId === filtroPozo

    // Filtro por batería
    const matchesBateria = filtroBateria === "" || pozos.find((p) => p.id === ticket.pozoId)?.bateria === filtroBateria

    // Filtrar por fecha
    const fechaParts = ticket.fecha.split("-")
    const ano = fechaParts.length > 0 ? fechaParts[0] : ""
    const mes = fechaParts.length > 1 ? fechaParts[1] : ""
    const dia = fechaParts.length > 2 ? fechaParts[2] : ""

    const matchesDia = filtroDia === "" || dia === filtroDia
    const matchesMes = filtroMes === "" || mes === filtroMes
    const matchesAno = filtroAno === "" || ano === filtroAno

    // Filtro por rango de fechas
    let matchesRangoFechas = true
    if (filtroFechaInicio !== "" && filtroFechaFin !== "") {
      const fechaTicket = new Date(ticket.fecha)
      const fechaInicio = new Date(filtroFechaInicio)
      const fechaFin = new Date(filtroFechaFin)

      matchesRangoFechas = fechaTicket >= fechaInicio && fechaTicket <= fechaFin
    }

    return (
      matchesSearch && matchesPozo && matchesBateria && matchesDia && matchesMes && matchesAno && matchesRangoFechas
    )
  })

  // Función para manejar la selección de una lectura
  const handleSelectLectura = (ticket: Ticket) => {
    router.push({
      pathname: "/(tabs)/ticket",
      params: {
        ticketId: ticket.id,
        pozoId: ticket.pozoId,
        pozoNombre: ticket.pozoNombre,
        pozoUbicacion: ticket.pozoUbicacion,
        lecturaVolumen: ticket.lecturaVolumen,
        lecturaElectrica: ticket.lecturaElectrica,
        cargaMotor: ticket.cargaMotor,
        gastoPozo: ticket.gastoPozo,
        observaciones: ticket.observaciones,
      },
    })
  }

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
  const renderTicketItem = ({ item }: { item: Ticket }) => {
    // Encontrar el pozo correspondiente para obtener la batería
    const pozo = pozos.find((p) => p.id === item.pozoId)
    const bateria = pozo?.bateria || "No disponible"

    return (
      <TouchableOpacity style={styles.ticketItem} onPress={() => handleSelectLectura(item)} activeOpacity={0.7}>
        <View style={styles.ticketHeader}>
          <View style={styles.ticketHeaderLeft}>
            <Text style={styles.ticketId}>ID: {item.id.substring(0, 8)}</Text>
            <Text style={styles.ticketFecha}>Fecha: {item.fecha}</Text>
          </View>
          
        </View>

        <View style={styles.ticketContent}>
          <View style={styles.ticketRow}>
            <Text style={styles.ticketLabel}>Pozo:</Text>
            <Text style={styles.ticketValue}>{item.pozoNombre}</Text>
          </View>

          <View style={styles.ticketRow}>
            <Text style={styles.ticketLabel}>Predio:</Text>
            <Text style={styles.ticketValue}>{item.pozoUbicacion}</Text>
          </View>

          <View style={styles.ticketRow}>
            <Text style={styles.ticketLabel}>Batería:</Text>
            <Text style={styles.ticketValue}>{bateria}</Text>
          </View>

          <View style={styles.ticketRow}>
            <Text style={styles.ticketLabel}>Lector:</Text>
            <Text style={styles.ticketValue}>Juan Pérez</Text>
          </View>

          <View style={styles.ticketRow}>
            <Text style={styles.ticketLabel}>Lectura Volumen:</Text>
            <Text style={styles.ticketValue}>{item.lecturaVolumen}</Text>
           
          </View>

          <View style={styles.ticketRow}>
            <Text style={styles.ticketLabel}>Estado:</Text>
            <Text style={styles.ticketValue}>Funcionando</Text>
          </View>

          <View style={styles.ticketRow}>
            <Text style={styles.ticketLabel}>Extracción Manual:</Text>
            <Text style={styles.ticketValue}>Normal</Text>
          </View>

          <View style={styles.ticketRow}>
            <Text style={styles.ticketLabel}>Tipo de descarga:</Text>
            <Text style={styles.ticketValue}>Libre</Text>
          </View>

          <View style={styles.ticketRow}>
            <Text style={styles.ticketLabel}>Lectura Eléctrica:</Text>
            <Text style={styles.ticketValue}>{item.lecturaElectrica}</Text>
           
          </View>

          <View style={styles.ticketRow}>
            <Text style={styles.ticketLabel}>Carga del Motor:</Text>
            <Text style={styles.ticketValue}>{item.cargaMotor || "###"}</Text>
          </View>

          <View style={styles.ticketRow}>
            <Text style={styles.ticketLabel}>Gasto del Pozo:</Text>
            <Text style={styles.ticketValue}>{item.gastoPozo || "1234"}</Text>
          </View>

          <View style={styles.ticketRow}>
            <Text style={styles.ticketLabel}>Distancia:</Text>
            <Text style={styles.ticketValue}>Correcta</Text>
          </View>

          <View style={styles.ticketRow}>
            <Text style={styles.ticketLabel}>Observaciones:</Text>
            <Text style={styles.ticketValue}>{item.observaciones || "-"}</Text>
          </View>
        </View>
      </TouchableOpacity>
    )
  }

  // Renderizar separador entre items
  const renderSeparator = () => <View style={styles.separator} />

  // Renderizar mensaje cuando no hay resultados
  const renderEmptyList = () => (
    <View style={styles.emptyContainer}>
      <Ionicons name="document-text-outline" size={64} color="#ccc" />
      <Text style={styles.emptyText}>No se encontraron lecturas</Text>
      <Text style={styles.emptySubtext}>Intente con otros filtros o realice nuevas capturas</Text>
      <TouchableOpacity style={styles.clearFiltersButton} onPress={handleClearFilters}>
        <Text style={styles.clearFiltersText}>Limpiar filtros</Text>
      </TouchableOpacity>
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
          <Text style={styles.activeFiltersText}>Filtros activos: {filteredTickets.length} resultados</Text>
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
          data={filteredTickets}
          renderItem={renderTicketItem}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.listContent}
          ItemSeparatorComponent={renderSeparator}
          ListEmptyComponent={renderEmptyList}
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
                          {pozo.nombre}
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
                        key={bateria}
                        style={[styles.filterChip, filtroBateria === bateria && styles.filterChipSelected]}
                        onPress={() => setFiltroBateria(bateria)}
                      >
                        <Text
                          style={[styles.filterChipText, filtroBateria === bateria && styles.filterChipTextSelected]}
                        >
                          {bateria}
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
                        key={ano}
                        style={[styles.filterChip, filtroAno === ano && styles.filterChipSelected]}
                        onPress={() => setFiltroAno(ano)}
                      >
                        <Text style={[styles.filterChipText, filtroAno === ano && styles.filterChipTextSelected]}>
                          {ano}
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
                          {mes.label}
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
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
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
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
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

